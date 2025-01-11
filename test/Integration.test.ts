import { App, Environment, Stack } from 'aws-cdk-lib'
import { Template } from 'aws-cdk-lib/assertions'
import { LexieUserManagement } from '../src'

describe('Integration', () => {
  const testEnv: Environment = {
    account: '00000000',
    region: 'eu-central-1',
  }

  test('all', () => {
    const app = new App()
    const stack = new Stack(app, 'Stack', {
      env: testEnv,
    })
    const lexie = new LexieUserManagement(stack, 'Lexie')
    lexie.addCustomDomain({
      domainName: 'example.com',
      cname: 'auth',
    })

    const template = Template.fromJSON(app)
    expect(template.toJSON()).toMatchSnapshot()
  })
})