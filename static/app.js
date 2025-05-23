// Access Amplify from the global window object
const Amplify = window.aws_amplify?.Amplify || window.Amplify;
const Auth = Amplify.Auth;

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
      responseType: 'code',
      pkce: true
    }
  }
};

Amplify.configure(amplifyConfig);

// ==== API URLs (Injected at deploy time) ====
const WRITE_LOG_URL = '__WRITE_LOG_URL__';
const GET_LOGS_URL = '__GET_LOGS_URL__';

// UI Elements
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userInfo = document.getElementById('userInfo');
const logSection = document.getElementById('logSection');
const logsSection = document.getElementById('logsSection');
const severityInput = document.getElementById('severity');
const messageInput = document.getElementById('message');
const logList = document.getElementById('logList');

// ==== On Load, Check Auth Status ====
checkUser();

async function checkUser() {
  try {
    const user = await Auth.currentAuthenticatedUser();
    const email = user?.attributes?.email || user?.username || 'Unknown user';

    userInfo.textContent = `✅ Logged in as: ${email}`;
    loginBtn.style.display = 'none';
    logoutBtn.style.display = 'inline-block';
    logSection.style.display = 'block';
    logsSection.style.display = 'block';

    loadLogs();
  } catch {
    userInfo.textContent = '🔐 Not logged in.';
    loginBtn.style.display = 'inline-block';
    logoutBtn.style.display = 'none';
    logSection.style.display = 'none';
    logsSection.style.display = 'none';
  }
}

// ==== Login using Hosted UI ====
if (loginBtn) {
  loginBtn.onclick = () => {
    Auth.federatedSignIn();
  };
}

// ==== Logout ====
if (logoutBtn) {
  logoutBtn.onclick = async () => {
    await Auth.signOut({ global: true });
    window.location.href = '/';
  };
}

// ==== Get Access Token ====
async function getJwtToken() {
  try {
    const session = await Auth.currentSession();
    return session.getIdToken().getJwtToken();
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

  const severity = severityInput.value;
  const message = messageInput.value.trim();

  if (!message) {
    alert('Please enter a log message');
    return;
  }

  const allowedSeverities = ['info', 'warning', 'error'];
  if (!allowedSeverities.includes(severity)) {
    alert(`Severity must be one of: ${allowedSeverities.join(', ')}`);
    return;
  }

  try {
    const response = await fetch(WRITE_LOG_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ severity, message })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to submit log');
    }

    alert(result.message || 'Log submitted');
    messageInput.value = '';
    loadLogs();
  } catch (err) {
    console.error('Submit error:', err);
    alert(err.message || 'An error occurred while submitting the log.');
  }
}

// ==== Load Logs ====
async function loadLogs() {
  const token = await getJwtToken();
  if (!token) {
    alert('You must login first');
    return;
  }

  try {
    const res = await fetch(GET_LOGS_URL, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const logs = await res.json();

    if (!res.ok || !Array.isArray(logs)) {
      throw new Error('Failed to load logs');
    }

    logList.innerHTML = '';
    logs.forEach(log => {
      const item = document.createElement('li');
      item.textContent = `[${log.datetime}] ${log.severity.toUpperCase()}: ${log.message}`;
      logList.appendChild(item);
    });
  } catch (err) {
    console.error('Load error:', err);
    alert(err.message || 'An error occurred while loading logs.');
  }
}
