// ==== CONFIGURE AMPLIFY ====
Amplify.configure({
  Auth: {
    region: 'YOUR_AWS_REGION',            // e.g. 'us-east-1'
    userPoolId: 'YOUR_USER_POOL_ID',      // e.g. 'us-east-1_XXXXXXX'
    userPoolWebClientId: 'YOUR_APP_CLIENT_ID',  // e.g. 'xxxxxxxxxxxx'
    authenticationFlowType: 'USER_PASSWORD_AUTH',
  }
});

// ==== API URLs (Inject these at deploy time) ====
const WRITE_LOG_URL = '__WRITE_LOG_URL__';
const GET_LOGS_URL = '__GET_LOGS_URL__';

// UI elements
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const authMessage = document.getElementById('authMessage');
const authSection = document.getElementById('authSection');
const logSection = document.getElementById('logSection');
const logsDisplay = document.getElementById('logsDisplay');

loginBtn.onclick = async () => {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!username || !password) {
    authMessage.textContent = 'Please enter username and password.';
    return;
  }
  
  authMessage.textContent = 'Logging in...';
  try {
    await Amplify.Auth.signIn(username, password);
    authMessage.textContent = 'Login successful!';
    loginBtn.style.display = 'none';
    logoutBtn.style.display = 'inline-block';
    authSection.style.display = 'none';
    logSection.style.display = 'block';
    logsDisplay.style.display = 'block';
    loadLogs();
  } catch (error) {
    authMessage.textContent = 'Login failed: ' + error.message;
  }
};

logoutBtn.onclick = async () => {
  await Amplify.Auth.signOut();
  authMessage.textContent = 'Logged out.';
  loginBtn.style.display = 'inline-block';
  logoutBtn.style.display = 'none';
  authSection.style.display = 'block';
  logSection.style.display = 'none';
  logsDisplay.style.display = 'none';
};

// Helper: get current JWT token
async function getJwtToken() {
  try {
    const session = await Amplify.Auth.currentSession();
    return session.getIdToken().getJwtToken();
  } catch {
    return null;
  }
}

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
  alert(result.message || result.error || 'Submitted');
  loadLogs();
}

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
