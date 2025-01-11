import { CfnOutput, Duration, RemovalPolicy } from 'aws-cdk-lib'
import { DnsValidatedCertificate } from 'aws-cdk-lib/aws-certificatemanager'
import { StringAttribute, UserPool, UserPoolDomain, UserPoolProps, VerificationEmailStyle } from 'aws-cdk-lib/aws-cognito'
import { AttributeType, BillingMode, Table, TableEncryption, TableProps } from 'aws-cdk-lib/aws-dynamodb'
import { ARecord, HostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53'
import { UserPoolDomainTarget } from 'aws-cdk-lib/aws-route53-targets'
import { Construct } from 'constructs'

export type LexieUserManagementTableProps = Omit<TableProps, 'sortKey' | 'partitionKey'>

export type LexieUserManagementUserPoolProps = Omit<UserPoolProps, 'customAttributes' | 'standardAttributes' | 'userVerification'>

export type LexieUserManagementAddCustomDomainProps = {
  /**
   * Cname of the domain
   *
   * Default: only use domainName without a cname
   */
  cname?: string;
  /**
   * Zone domain
   */
  domainName: string;
}

export type LexieUserManagementProps = {
  /**
   * Props for the Dynamodb Table
   */
  table?: LexieUserManagementTableProps;
  /**
   * Props for the User pool
   */
  userPool?: LexieUserManagementUserPoolProps;
}

export class LexieUserManagement extends Construct {
  private readonly id: string
  readonly dynamoDbTable: Table
  readonly userPool: UserPool

  constructor(scope: Construct, id: string, props?: LexieUserManagementProps) {
    super(scope, id)

    this.id = id

    const {
      table,
      userPool,
    } = props || {}

    this.dynamoDbTable = new Table(this, `${id}Table`, {
      removalPolicy: RemovalPolicy.RETAIN,
      billingMode: BillingMode.PAY_PER_REQUEST,
      deletionProtection: true,
      encryption: TableEncryption.AWS_MANAGED,
      ...table,
      partitionKey: {
        type: AttributeType.STRING,
        name: 'sub',
      },
      sortKey: {
        type: AttributeType.STRING,
        name: 'type',
      },
    })
    this.userPool = new UserPool(scope, `${id}UserPool`, {
      signInCaseSensitive: false,
      selfSignUpEnabled: true,
      passwordPolicy: {
        minLength: 9,
        requireDigits: true,
        requireUppercase: true,
        requireSymbols: true,
        requireLowercase: true,
      },
      ...userPool,
      signInAliases: {
        email: true,
      },
      standardAttributes: {
        email: {
          mutable: true,
          required: true,
        },
        nickname: {
          mutable: true,
          required: true,
        },
        profilePicture: {
          mutable: true,
          required: true,
        },
      },
      customAttributes: {
        id: new StringAttribute({ minLen: 22, maxLen: 36, mutable: false }),
      },
      userVerification: {
        emailStyle: VerificationEmailStyle.CODE,
      },
    })
  }

  addCustomDomain = (
    { domainName, cname }: LexieUserManagementAddCustomDomainProps,
  ) => {
    const zone = HostedZone.fromLookup(this, 'CustomDomainZone', {
      domainName,
    })
    const fullDomain = cname ? `${cname}.${domainName}` : domainName
    const certificate = new DnsValidatedCertificate(this, 'UserPoolDomainCert', {
      region: 'us-east-1',
      domainName: fullDomain,
      hostedZone: zone,
    })
    const userPoolDomain = new UserPoolDomain(this, 'UserPoolDomain', {
      userPool: this.userPool,
      customDomain: {
        certificate,
        domainName: fullDomain,
      },
    })
    new ARecord(this, 'UserPoolDomainARecord', {
      zone,
      ttl: Duration.days(1),
      target: RecordTarget.fromAlias(new UserPoolDomainTarget(userPoolDomain)),
      recordName: cname ? cname : domainName,
    })
    new CfnOutput(this, 'CognitoDomainHost', {
      value: userPoolDomain.domainName,
      exportName: `${this.id}:Cognito:CustomDomain:Host`,
    })
    new CfnOutput(this, 'AuthorizedRedirectUrl', {
      value: `https://${userPoolDomain.domainName}/oauth2/idpresponse`,
      exportName: `${this.id}:Cognito:AuthorizedRedirectUrl`,
    })
  }
}