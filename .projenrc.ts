import { awscdk } from 'projen'
import { NodePackageManager } from 'projen/lib/javascript'

const project = new awscdk.AwsCdkConstructLibrary({
  author: 'd4ndel1on',
  authorAddress: 'stefan@fancynetwork.net',
  cdkVersion: '2.170.0',
  defaultReleaseBranch: 'main',
  jsiiVersion: '~5.5.4',
  name: '@cdk-libs/lexie',
  projenrcTs: true,
  repositoryUrl: 'https://github.com/cdk-libs/lexie.git',
  eslint: true,
  depsUpgradeOptions: {
    workflow: false,
  },
  packageManager: NodePackageManager.NPM,
  minNodeVersion: '20.16.0',
  pullRequestTemplateContents: [
    '## Description:\n' +
    'Fill your description here\n' +
    '\n' +
    '## Changes:\n' +
    '* Your changes\n' +
    '\n',
  ],
  deps: [
    '@middy/core',
    '@middy/error-logger',
    '@middy/http-error-handler',
    '@middy/http-header-normalizer',
    '@middy/http-router',
    '@middy/http-cors',
    'http-errors',
    'aws-lambda',
  ],
  devDeps: ['esbuild', '@types/aws-lambda', '@types/http-errors', '@types/humps'],
  bundledDeps: [
    'http-errors',
    '@aws-lambda-powertools/logger',
    'humps',
    '@middy/core',
    '@middy/error-logger',
    '@middy/http-error-handler',
    '@middy/http-header-normalizer',
    '@middy/http-router',
    '@middy/http-cors',
    'aws-lambda',
  ],
})
project.addTask('pack', {
  exec: 'mkdir -p ~/.cdk-releases && npm run build && npm pack --pack-destination ~/.cdk-releases',
  description: 'Packs the current release for local development',
})
project.eslint?.addRules({
  'semi': ['error', 'never'],
  'comma-dangle': ['error', 'always-multiline'],
})
project.tryFindObjectFile('.github/workflows/build.yml')!
  .addOverride('jobs.build.steps.5.with', {
    'retention-days': 5,
  })
project.tryFindObjectFile('.github/workflows/build.yml')!
  .addOverride('jobs.build.steps.8.with', {
    'retention-days': 5,
  })
project.synth()