#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { SdesInfrastructureStack } from '../lib/sdes_infrastructure-stack';

const app = new cdk.App();
new SdesInfrastructureStack(app, 'SdesInfrastructureStack');