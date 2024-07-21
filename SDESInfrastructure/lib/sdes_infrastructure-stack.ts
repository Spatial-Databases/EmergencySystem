import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import { Construct } from 'constructs';
import { namingPrefix, githubOrganization, dbUsername, dbPort, ec2KeyPairName } from './constants';

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

const getEc2KeyPair = (scope: Construct, namingPrefix: string, ec2KeyPairName: string): ec2.IKeyPair => 
  ec2.KeyPair.fromKeyPairName(scope, `${namingPrefix}-ec2-key-pair`, ec2KeyPairName);

const createEc2SecurityGroup = (scope: Construct, vpc: ec2.Vpc, namingPrefix: string): ec2.SecurityGroup => {
  const ec2SecurityGroup = new ec2.SecurityGroup(scope, `${namingPrefix}-ec2-security-group`, {
    vpc: vpc,
    securityGroupName: `${namingPrefix}-ec2-security-group`
  });

  ec2SecurityGroup.addIngressRule(
    ec2.Peer.anyIpv4(),
    ec2.Port.tcp(22),
    'Allow SSH connections to the ec2 instance'
  );

  ec2SecurityGroup.addIngressRule(
    ec2.Peer.anyIpv4(),
    ec2.Port.tcp(5000),
    'Allow HTTP requests'
  );

  ec2SecurityGroup.addIngressRule(
    ec2.Peer.anyIpv4(),
    ec2.Port.tcp(443),
    'Allow HTTPS requests'
  );

  return ec2SecurityGroup;
}

const createEc2IAMRole = (scope: Construct, namingPrefix: string) => {
  const ec2IAMRole = new iam.Role(scope, `${namingPrefix}-ec2-role`, {
    assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
    roleName: `${namingPrefix}-ec2-role`
  });

  ec2IAMRole.addToPolicy(
    new iam.PolicyStatement({
      actions: ['secretsmanager:GetSecretValue', 'ssm:GetParameter'],
      resources: ['*']
    })
  );

  return ec2IAMRole
}

const createEc2Instance = (scope: Construct, vpc: ec2.Vpc, ec2KeyPair: ec2.IKeyPair, ec2SecurityGroup: ec2.SecurityGroup, ec2IAMRole: iam.Role, namingPrefix: string): ec2.Instance => {
  const ec2Instance = new ec2.Instance(scope, `${namingPrefix}-ec2-instance`, {
    instanceName: `${namingPrefix}-ec2-instance`,
    vpc: vpc,
    vpcSubnets: {
      subnetType: ec2.SubnetType.PUBLIC
    },
    instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE3, ec2.InstanceSize.MICRO),
    keyPair: ec2KeyPair,
    machineImage: new ec2.AmazonLinuxImage({
      generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2
    }),
    securityGroup: ec2SecurityGroup,
    role: ec2IAMRole
  });

  return ec2Instance;
}


export class SdesInfrastructureStack extends cdk.Stack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    // Let's gooo
    createOIDCProvider(this, this.account, githubOrganization, namingPrefix);

    const vpc = createVpc(this, namingPrefix);

    const dbSecurityGroup = createDbSecurityGroup(this, vpc, dbPort, namingPrefix);
    const dbInstance = createDBInstance(this, vpc, dbSecurityGroup, dbUsername, dbPort, namingPrefix);

    const ec2KeyPair = getEc2KeyPair(this, namingPrefix, ec2KeyPairName);
    const ec2SecurityGroup = createEc2SecurityGroup(this, vpc, namingPrefix);
    const ec2IAMRole = createEc2IAMRole(this, namingPrefix);
    const ec2Instance = createEc2Instance(this, vpc, ec2KeyPair, ec2SecurityGroup, ec2IAMRole, namingPrefix);
  }
}
