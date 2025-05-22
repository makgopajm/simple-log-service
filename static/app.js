// Required when using the CDN version of Amplify v4
const Amplify = window.aws_amplify.Amplify || window.Amplify;

// ==== CONFIGURE AMPLIFY ====
const amplifyConfig = {
  Auth: {
    region: '__COGNITO_REGION__',
    userPoolId: '__USER_POOL_ID__',
    userPoolWebClientId: '__USER_POOL_CLIENT_ID__',
    oauth: {
      domain: 'log-service-auth.auth.us-east-1.amazoncognito.com',
      scope: ['openid', 'email', 'profile'],
      redirectSignIn: 'https://logging-service.urbanversatile.com/',
      redirectSignOut: 'https://logging-service.urbanversatile.com/',
      responseType: 'code'
    }
  }
};

Amplify.configure(amplifyConfig);
const Auth = Amplify.Auth;

// ==== API URLs (Injected at deploy time) ====
const WRITE_LOG_URL = '__WRITE_LOG_URL__';
const GET_LOGS_URL = '__GET_LOGS_URL__';

// UI Elements
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userInfo = document.getElementById('userInfo');
const logSection = document.querySelector('.card:nth-of-type(2)');
const logsSection = document.querySelector('.card:nth-of-type(3)');

// ==== On Load, Check Auth Status ====
checkUser();

async function checkUser() {
  try {
    const user = await Auth.currentAuthenticatedUser();
    const session = await Auth.currentSession();
    const email = user.attributes.email || user.username;

    userInfo.textContent = `✅ Logged in as: ${email}`;
    loginBtn.style.display = 'none';
    logoutBtn.style.display = 'inline-block';
    logSection.style.display = 'block';
    logsSection.style.display = 'block';
    loadLogs();
  } catch (err) {
    userInfo.textContent = '🔐 Not logged in.';
    loginBtn.style.display = 'inline-block';
    logoutBtn.style.display = 'none';
    logSection.style.display = 'none';
    logsSection.style.display = 'none';
  }
}

// ==== Login using Hosted UI ====
loginBtn.onclick = () => {
  Auth.federatedSignIn();
};

// ==== Logout ====
logoutBtn.onclick = async () => {
  await Auth.signOut({ global: true });
  window.location.href = '/'; // Reload home page after logout
};

// ==== Get Access Token ====
async function getJwtToken() {
  try {
    const session = await Auth.currentSession();
    return session.getAccessToken().getJwtToken(); // API Gateway expects access token
  } catch {
    return null;
  }
}

// ==== Submit Log ====
async function sendLog() {
  const token = await getJwtToken();
  if (!token) {
    alert('You must login first');
    return;
  }

  const severity = document.getElementById('severity').value;
  const message = document.getElementById('message').value;

  if (!message.trim()) {
    alert('Please enter a log message');
    return;
  }

  const response = await fetch(WRITE_LOG_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token
    },
    body: JSON.stringify({ severity, message })
  });

  const result = await response.json();
  alert(result.message || result.error || 'Log submitted');
  loadLogs();
}

// ==== Load Logs ====
async function loadLogs() {
  const token = await getJwtToken();
  if (!token) {
    alert('You must login first');
    return;
  }

  const res = await fetch(GET_LOGS_URL, {
    headers: {
      'Authorization': token
    }
  });

  const logs = await res.json();

  const list = document.getElementById('logList');
  list.innerHTML = '';

  logs.forEach(log => {
    const item = document.createElement('li');
    item.textContent = `[${log.datetime}] ${log.severity.toUpperCase()}: ${log.message}`;
    list.appendChild(item);
  });
}
