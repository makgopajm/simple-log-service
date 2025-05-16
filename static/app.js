const WRITE_LOG_URL = 'https://hent4zgw0j.execute-api.us-east-1.amazonaws.com/dev/write-logs';
const GET_LOGS_URL = 'https://hent4zgw0j.execute-api.us-east-1.amazonaws.com/dev/read-logs';

async function sendLog() {
  const severity = document.getElementById('severity').value;
  const message = document.getElementById('message').value;

  const response = await fetch(WRITE_LOG_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ severity, message })
  });

  const result = await response.json();
  alert(result.message || result.error || 'Submitted');
}

async function loadLogs() {
  const res = await fetch(GET_LOGS_URL);
  const logs = await res.json();

  const list = document.getElementById('logList');
  list.innerHTML = '';

  logs.forEach(log => {
    const item = document.createElement('li');
    item.textContent = `[${log.datetime}] ${log.severity.toUpperCase()}: ${log.message}`;
    list.appendChild(item);
  });
}
