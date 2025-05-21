<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Simple Log Service with Cognito Auth</title>
  <link rel="stylesheet" href="style.css" />
  <!-- AWS Amplify -->
  <script src="https://unpkg.com/aws-amplify@4.3.17/dist/aws-amplify.min.js"></script>
</head>
<body>
  <div class="container">
    <h1>📝 Simple Log Service</h1>

    <section class="card" id="authSection">
      <h2>User Authentication</h2>
      <label for="username">Username (email):</label>
      <input type="text" id="username" placeholder="Enter username" />
      
      <label for="password">Password:</label>
      <input type="password" id="password" placeholder="Enter password" />
      
      <button id="loginBtn">Login</button>
      <button id="logoutBtn" style="display:none;">Logout</button>
      <p id="authMessage"></p>
    </section>

    <section class="card" id="logSection" style="display:none;">
      <h2>Write a Log Entry</h2>
      <label for="severity">Severity:</label>
      <select id="severity">
        <option value="info">Info</option>
        <option value="warning">Warning</option>
        <option value="error">Error</option>
      </select>

      <label for="message">Message:</label>
      <input type="text" id="message" placeholder="Enter your log message" />

      <button onclick="sendLog()">Submit Log</button>
    </section>

    <section class="card" id="logsDisplay" style="display:none;">
      <h2>Recent Logs</h2>
      <button class="refresh-btn" onclick="loadLogs()">🔄 Refresh Logs</button>
      <ul id="logList"></ul>
    </section>
  </div>

  <script src="app.js"></script>
</body>
</html>
