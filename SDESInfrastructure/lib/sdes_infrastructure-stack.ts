import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { namingPrefix, githubOrganization } from './constants';

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

export class SdesInfrastructureStack extends cdk.Stack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    // Let's gooo
    createOIDCProvider(this, this.account, githubOrganization, namingPrefix)
  }
}
