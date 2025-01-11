import { awscdk } from 'projen'
import { NodePackageManager, NpmAccess } from 'projen/lib/javascript'

const project = new awscdk.AwsCdkConstructLibrary({
  author: 'd4ndel1on',
  authorAddress: 'stefan@fancynetwork.net',
  cdkVersion: '2.175.1',
  defaultReleaseBranch: 'main',
  jsiiVersion: '~5.5.4',
  name: '@cdk-libs/lexie',
  projenrcTs: true,
  repositoryUrl: 'https://github.com/cdk-libs/lexie.git',
  eslint: true,
  npmAccess: NpmAccess.PUBLIC,
  releaseToNpm: true,
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
  exec: 'rm -rf dist && mkdir -p ~/.releases && npm run build && npm pack --pack-destination ~/.releases',
  description: 'Packs the current release for local development',
})
project.addTask('update', {
  exec: './scripts/update.sh',
  description: 'Update versions including CDK version',
})
project.addTask('pack:nt', {
  exec: 'rm -rf dist && mkdir -p ~/.releases && npm run build:nt && npm pack --pack-destination ~/.releases',
  description: 'Packs the current release for local development without tests. Use with caution!',
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