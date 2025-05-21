import { Amplify } from 'aws-amplify';

Amplify.configure({
  Auth: {
    region: 'us-east-1',
    userPoolId: 'us-east-1_XXXXXXX',
    userPoolWebClientId: 'YYYYYYYYYYYYYYYYYYYYY',
    oauth: {
      domain: 'your-auth-domain.auth.us-east-1.amazoncognito.com',
      scope: ['email', 'openid'],
      redirectSignIn: 'https://your-cloudfront-url.com/',
      redirectSignOut: 'https://your-cloudfront-url.com/',
      responseType: 'code'
    }
  }
});
