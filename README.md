## Introduction

This is a sample repositories with the basic .yml configuration to deploy some lambda funcitons in a vpn, in order to have access to some private AWS resources (like an RDS database)

## Cognito authorizer

Defining a cognito authorizer give use the chance to make the Apis autenticated and not publicly accessible 

## DOTENV plugin

with the dotenv plugin we can define .env files for different environment with the configuration variable (db connection string, vpc, security groups etc).

## Warm-up plugin

In the .yml file there is also the basic setup for the warm-up plugin, in order to avoid the cold start problem of lambdas