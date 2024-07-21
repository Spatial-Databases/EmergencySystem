import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import { Construct } from 'constructs';
import { namingPrefix, githubOrganization, dbUsername, dbPort } from './constants';

const createOIDCProvider = (scope: Construct, account: string, githubOrganization: string, namingPrefix: string) => {
  const provider = new iam.OpenIdConnectProvider(scope, `${namingPrefix}-oidc-provider`, {
    url: 'https://token.actions.githubusercontent.com',
    clientIds: ['sts.amazonaws.com']
  });

  const githubPrincipal = new iam.OpenIdConnectPrincipal(provider).withConditions({
    StringLike: {
      'token.actions.githubusercontent.com:sub': `repo:${githubOrganization}/*`
    }
  });

  new iam.Role(scope, `${namingPrefix}-github-actions-role`, {
    assumedBy: githubPrincipal,
    description: 'Role to assume for github actions',
    roleName: `${namingPrefix}-github-actions-role`,
    maxSessionDuration: cdk.Duration.hours(1),
    inlinePolicies: {
      cdkDeploymentPolicy: new iam.PolicyDocument({
        assignSids: true,
        statements: [
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['sts.AssumeRole'],
            resources: [`arn:aws:iam::${account}:role:cdk-/*`],
          }),
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['ec2:DescribeInstances', 'ssm:GetParameter', 'secretsmanager:GetSecretValue'],
            resources: ['*']
          })
        ]
      })
    }
  });
}

const createVpc = (scope: Construct, namingPrefix: string): ec2.Vpc => {
  const vpc = new ec2.Vpc(scope, `${namingPrefix}-vpc`, {
    ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/24'),
    natGateways: 1,
    subnetConfiguration: [
      {
        name: `${namingPrefix}-public-subnet-1`,
        subnetType: ec2.SubnetType.PUBLIC,
        cidrMask: 28
      }
    ]
  });

  return vpc;
}

const createDbSecurityGroup = (scope: Construct, vpc: ec2.Vpc, dbPort: number, namingPrefix: string): ec2.SecurityGroup => {
  const dbSecurityGroup = new ec2.SecurityGroup(scope, `${namingPrefix}-db-security-group`, {
    vpc: vpc,
    securityGroupName: `${namingPrefix}-db-security-group`
  });

  dbSecurityGroup.addIngressRule(
    ec2.Peer.anyIpv4(),
    ec2.Port.tcp(dbPort),
    'Allow connections to the database'
  );

  return dbSecurityGroup;
}

const createDBInstance = (scope: Construct, vpc: ec2.Vpc, dbSecurityGroup: ec2.SecurityGroup, dbUsername: string, dbPort: number, namingPrefix: string): rds.DatabaseInstance => {
  const dbInstance = new rds.DatabaseInstance(scope, `${namingPrefix}-db-instance`, {
    vpc: vpc,
    vpcSubnets: {
      subnetType: ec2.SubnetType.PUBLIC
    },
    engine: rds.DatabaseInstanceEngine.postgres({
      version: rds.PostgresEngineVersion.VER_16_3
    }),
    instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE3, ec2.InstanceSize.MICRO),
    credentials: rds.Credentials.fromGeneratedSecret(dbUsername, {
      secretName: `${namingPrefix}-db-instance-credentials`
    }),
    multiAz: false,
    allocatedStorage: 10,
    removalPolicy: cdk.RemovalPolicy.DESTROY,
    securityGroups: [dbSecurityGroup],
    instanceIdentifier: `${namingPrefix}-db`,
    port: dbPort
  });

  return dbInstance;
}

export class SdesInfrastructureStack extends cdk.Stack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    // Let's gooo
    createOIDCProvider(this, this.account, githubOrganization, namingPrefix);

    const vpc = createVpc(this, namingPrefix);

    const dbSecurityGroup = createDbSecurityGroup(this, vpc, dbPort, namingPrefix);
    const dbInstance = createDBInstance(this, vpc, dbSecurityGroup, dbUsername, dbPort, namingPrefix);
  }
}
