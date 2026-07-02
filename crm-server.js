const express = require('express');
const path = require('path');
const { spawn } = require('child_process');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static('public'));

// Start Telegram Bot as child process
console.log('🤖 Starting Telegram Bot...');
const botProcess = spawn('node', ['telegram-bot.js']);

botProcess.stdout.on('data', (data) => {
  console.log(`BOT: ${data}`);
});

botProcess.stderr.on('data', (data) => {
  console.error(`BOT ERROR: ${data}`);
});

botProcess.on('close', (code) => {
  console.log(`Bot process exited with code ${code}`);
});

// Sample leads data
const leads = [
  { id: 1, name: 'Nelio', username: '', broker: 'vantage', mt5: '', status: 'pending', progress: 2, lastSeen: '2h ago', drip: 0 },
  { id: 2, name: 'Chase', username: '@chas3r8', broker: 'vantage', mt5: '', status: 'pending', progress: 2, lastSeen: '3h ago', drip: 0 },
  { id: 3, name: 'Daz', username: '', broker: 'puprime', mt5: '', status: 'pending', progress: 3, lastSeen: '21h ago', drip: 2 },
  { id: 4, name: 'rashed', username: '', broker: 'vantage', mt5: '', status: 'pending', progress: 3, lastSeen: '2d ago', drip: 7 },
  { id: 5, name: 'Shiv', username: '', broker: 'puprime', mt5: '', status: 'pending', progress: 2, lastSeen: '5d ago', drip: 14 },
  { id: 6, name: 'Rohit', username: '', broker: 'puprime', mt5: '', status: 'pending', progress: 2, lastSeen: '6d ago', drip: 14 },
  { id: 7, name: 'Jimbo', username: '', broker: 'vantage', mt5: '', status: 'pending', progress: 3, lastSeen: '6d ago', drip: 13 },
  { id: 8, name: 'Chrono', username: '', broker: 'vantage', mt5: '', status: 'pending', progress: 2, lastSeen: '6d ago', drip: 0 },
  { id: 9, name: 'Silentfx', username: '', broker: 'vantage', mt5: '', status: 'pending', progress: 3, lastSeen: '6d ago', drip: 0 },
  { id: 10, name: 'Dylan', username: '', broker: 'vantage', mt5: '', status: 'pending', progress: 2, lastSeen: '6d ago', drip: 14 },
  { id: 11, name: 'S', username: '@SAMZ262', broker: 'vantage', mt5: '', status: 'pending', progress: 3, lastSeen: '7d ago', drip: 15 },
  { id: 12, name: 'Sandor', username: '', broker: 'vantage', mt5: '10120190', status: 'completed', progress: 5, lastSeen: '6d ago', drip: 1 },
  { id: 13, name: 'Natalie', username: '', broker: 'puprime', mt5: '', status: 'pending', progress: 3, lastSeen: '7d ago', drip: 15 },
  { id: 14, name: 'Ray', username: '@RayGoldSignals', broker: 'vantage', mt5: '', status: 'pending', progress: 2, lastSeen: '7d ago', drip: 15 },
  { id: 15, name: 'Frank | GOLD SIGNALS ALL DAY 🚨', username: '@Frank_GoldSignals', broker: 'vantage', mt5: '', status: 'pending', progress: 3, lastSeen: '7d ago', drip: 15 },
  { id: 16, name: 'Trey', username: '@trey20050', broker: 'vantage', mt5: '', status: 'pending', progress: 2, lastSeen: '7d ago', drip: 16 },
  { id: 17, name: 'Charlie Gold Guy | 🔔', username: '@charlieslifestyle', broker: 'vantage', mt5: '77777', status: 'completed', progress: 5, lastSeen: '7d ago', drip: 0 },
  { id: 18, name: 'Muhammad', username: '', broker: 'vantage', mt5: '', status: 'pending', progress: 3, lastSeen: '8d ago', drip: 2 },
  { id: 19, name: 'AllOF8', username: '@AllOf8thBatch', broker: 'vantage', mt5: '', status: 'pending', progress: 3, lastSeen: '8d ago', drip: 7 },
  { id: 20, name: 'Tazeem', username: '@Tazeem1210', broker: 'vantage', mt5: '20811985', status: 'completed', progress: 5, lastSeen: '7d ago', drip: 0 },
  { id: 21, name: 'Electronics', username: '@Binance2105', broker: 'vantage', mt5: '', status: 'pending', progress: 2, lastSeen: '8d ago', drip: 17 },
  { id: 22, name: 'Cindy', username: '', broker: 'vantage', mt5: '', status: 'pending', progress: 2, lastSeen: '8d ago', drip: 17 },
  { id: 23, name: 'Marko L', username: '', broker: 'vantage', mt5: '', status: 'pending', progress: 2, lastSeen: '8d ago', drip: 0 },
  { id: 24, name: 'Pas', username: '@TraderPas', broker: 'vantage', mt5: '', status: 'pending', progress: 2, lastSeen: '-', drip: 14 },
  { id: 25, name: '­­', username: '@QQmqmqmqmqmq', broker: 'vantage', mt5: '', status: 'pending', progress: 3, lastSeen: '8d ago', drip: 17 },
  { id: 26, name: 'Shino', username: '@Yeeduk', broker: 'vantage', mt5: '', status: 'pending', progress: 2, lastSeen: '-', drip: 18 },
  { id: 27, name: 'Balmain', username: '', broker: '', mt5: '', status: 'pending', progress: 1, lastSeen: '-', drip: 18 },
  { id: 28, name: 'Richard', username: '', broker: 'vantage', mt5: '34628!3', status: 'completed', progress: 5, lastSeen: '7d ago', drip: 5 },
  { id: 29, name: 'Echo', username: '', broker: 'vantage', mt5: '828282', status: 'completed', progress: 5, lastSeen: '-', drip: 0 },
];

let messages = {};

// API Routes
app.get('/api/stats', (req, res) => {
  const total = leads.length;
  const done = leads.filter(l => l.status === 'completed').length;
  const pending = leads.filter(l => l.status === 'pending').length;
  const vantage = leads.filter(l => l.broker === 'vantage').length;
  const puprime = leads.filter(l => l.broker === 'puprime').length;
  
  res.json({ total, done, pending, vantage, puprime });
});

app.get('/api/leads', (req, res) => {
  res.json(leads);
});

app.post('/api/broadcast', (req, res) => {
  const { message, type } = req.body;
  res.json({ success: true, sent: leads.length });
});

app.post('/api/leads/:id/message', (req, res) => {
  const { text } = req.body;
  const leadId = parseInt(req.params.id);
  
  if (!messages[leadId]) messages[leadId] = [];
  messages[leadId].push({ sender: 'admin', text, time: new Date() });
  
  res.json({ success: true });
});

app.get('/api/leads/:id/messages', (req, res) => {
  const leadId = parseInt(req.params.id);
  res.json(messages[leadId] || []);
});

app.put('/api/leads/:id/status', (req, res) => {
  const { status } = req.body;
  const lead = leads.find(l => l.id === parseInt(req.params.id));
  if (lead) lead.status = status;
  res.json({ success: true });
});

// Serve dashboard
app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>👑 Kevin VIP CRM</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #1a1a2e;
      color: #e0e0e0;
      padding: 20px;
    }
    .container { max-width: 1600px; margin: 0 auto; }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 25px;
      border-bottom: 2px solid #ffc700;
      padding-bottom: 15px;
    }
    .header h1 { color: #ffc700; font-size: 28px; }
    .header p { color: #999; font-size: 13px; }
    .time { font-size: 12px; color: #999; text-align: right; }
    .stats {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 12px;
      margin-bottom: 25px;
    }
    .stat { 
      background: #0f3460; 
      border: 1px solid #16213e;
      border-radius: 8px;
      padding: 15px;
      text-align: center;
    }
    .stat.total { border-left: 4px solid #ffc700; }
    .stat.done { border-left: 4px solid #4caf50; }
    .stat.pending { border-left: 4px solid #ff9800; }
    .stat.vantage { border-left: 4px solid #2196f3; }
    .stat.puprime { border-left: 4px solid #f44336; }
    .stat-num { font-size: 32px; font-weight: bold; margin-bottom: 3px; }
    .stat-label { font-size: 11px; color: #999; }
    .broadcast {
      background: #0f3460;
      border: 1px solid #16213e;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 25px;
    }
    .broadcast h3 { color: #ffc700; font-size: 14px; margin-bottom: 10px; }
    textarea {
      width: 100%;
      padding: 10px;
      background: #1a2a4a;
      border: 1px solid #16213e;
      border-radius: 6px;
      color: #e0e0e0;
      font-family: inherit;
      margin-bottom: 10px;
      min-height: 80px;
    }
    .btn-group {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-bottom: 10px;
    }
    .btn {
      padding: 8px 12px;
      border: 1px solid #16213e;
      background: #1a2a4a;
      color: #e0e0e0;
      border-radius: 6px;
      cursor: pointer;
      font-size: 12px;
      transition: all 0.2s;
    }
    .btn:hover { background: #243550; }
    .btn.active { background: #ffc700; color: #000; border-color: #ffc700; }
    .table-container {
      background: #0f3460;
      border: 1px solid #16213e;
      border-radius: 8px;
      overflow-x: auto;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }
    thead {
      background: #16213e;
      border-bottom: 2px solid #ffc700;
    }
    th {
      padding: 10px;
      text-align: left;
      font-weight: 600;
      color: #ffc700;
    }
    td {
      padding: 8px 10px;
      border-bottom: 1px solid #1a2a4a;
    }
    tbody tr:hover { background: #1a4a7a; }
    .progress { display: flex; gap: 3px; }
    .step {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #333;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 9px;
      font-weight: bold;
      border: 1px solid #555;
    }
    .step.done { background: #4caf50; border-color: #4caf50; color: white; }
    .step.pending { background: #999; border-color: #999; color: white; }
    .action-btn {
      padding: 4px 8px;
      background: #1a2a4a;
      border: 1px solid #16213e;
      border-radius: 4px;
      color: #e0e0e0;
      cursor: pointer;
      font-size: 10px;
      margin-right: 3px;
    }
    .action-btn:hover { background: #243550; }
    .action-btn.mark-done { background: #4caf50; border-color: #4caf50; color: white; }
    @media (max-width: 768px) {
      .stats { grid-template-columns: repeat(2, 1fr); }
      table { font-size: 10px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <h1>👑 Kevin VIP CRM</h1>
        <p>Gold Signals — Lead Management</p>
      </div>
      <div class="time">
        <div id="time"></div>
        <p>Auto-refresh 30s</p>
      </div>
    </div>

    <div class="stats">
      <div class="stat total">
        <div class="stat-num" id="total">0</div>
        <div class="stat-label">Total</div>
      </div>
      <div class="stat done">
        <div class="stat-num" id="done">0</div>
        <div class="stat-label">✅ Done</div>
      </div>
      <div class="stat pending">
        <div class="stat-num" id="pending">0</div>
        <div class="stat-label">⏳ Pending</div>
      </div>
      <div class="stat vantage">
        <div class="stat-num" id="vantage">0</div>
        <div class="stat-label">🔵 Vantage</div>
      </div>
      <div class="stat puprime">
        <div class="stat-num" id="puprime">0</div>
        <div class="stat-label">🔴 PU Prime</div>
      </div>
    </div>

    <div class="broadcast">
      <h3>📢 Broadcast Message</h3>
      <p style="font-size: 11px; color: #999; margin-bottom: 10px;">Send to ALL pending leads (1 per day limit)</p>
      <textarea id="broadcast-text" placeholder="Your message..."></textarea>
      <div class="btn-group">
        <button class="btn active" onclick="setBroadcast('all_pending')">📢 All Pending</button>
        <button class="btn" onclick="setBroadcast('restart')">🔄 Restart Drips</button>
        <button class="btn" onclick="setBroadcast('not_started')">Not Started</button>
        <button class="btn" onclick="setBroadcast('vantage')">Vantage Only</button>
        <button class="btn" onclick="setBroadcast('puprime')">PU Prime Only</button>
      </div>
      <button class="btn" style="background: #ffc700; color: #000; border-color: #ffc700; width: 100%; font-weight: bold;" onclick="sendBroadcast()">Send Broadcast</button>
    </div>

    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Username</th>
            <th>Broker</th>
            <th>MT5</th>
            <th>Status</th>
            <th>Progress</th>
            <th>Last Seen</th>
            <th>Drip</th>
            <th>Chat</th>
            <th>Quick Send</th>
          </tr>
        </thead>
        <tbody id="table-body">
        </tbody>
      </table>
    </div>
  </div>

  <script>
    function updateTime() {
      const now = new Date();
      document.getElementById('time').textContent = now.toLocaleTimeString('en-GB');
    }
    updateTime();
    setInterval(updateTime, 1000);

    function updateStats() {
      fetch('/api/stats')
        .then(r => r.json())
        .then(d => {
          document.getElementById('total').textContent = d.total;
          document.getElementById('done').textContent = d.done;
          document.getElementById('pending').textContent = d.pending;
          document.getElementById('vantage').textContent = d.vantage;
          document.getElementById('puprime').textContent = d.puprime;
        });
    }

    function updateTable() {
      fetch('/api/leads')
        .then(r => r.json())
        .then(leads => {
          const html = leads.map((l, i) => \`
            <tr>
              <td>\${i+1}</td>
              <td><strong>\${l.name}</strong></td>
              <td>\${l.username || '-'}</td>
              <td>\${l.broker === 'vantage' ? '🔵 Vantage' : l.broker === 'puprime' ? '🔴 PU Prime' : '-'}</td>
              <td>\${l.mt5 || '—'}</td>
              <td>\${l.status === 'completed' ? '✅ Done' : '⏳ Pending'}</td>
              <td>
                <div class="progress">
                  \${[1,2,3,4,5].map(i => \`<div class="step \${i <= l.progress ? 'done' : 'pending'}">\${i}</div>\`).join('')}
                </div>
              </td>
              <td>\${l.lastSeen}</td>
              <td>\${l.drip}</td>
              <td><button class="action-btn" onclick="openChat(\${l.id})">💬</button></td>
              <td><button class="action-btn" onclick="quickMessage(\${l.id})">Send...</button></td>
            </tr>
          \`).join('');
          document.getElementById('table-body').innerHTML = html;
        });
    }

    function setBroadcast(type) {
      document.querySelectorAll('.broadcast .btn').forEach(b => b.classList.remove('active'));
      event.target.classList.add('active');
    }

    function sendBroadcast() {
      const msg = document.getElementById('broadcast-text').value;
      if (!msg) return alert('Enter a message');
      fetch('/api/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, type: 'all_pending' })
      }).then(() => {
        alert('✅ Broadcast sent!');
        document.getElementById('broadcast-text').value = '';
      });
    }

    function openChat(leadId) {
      alert('💬 Chat with lead ' + leadId);
    }

    function quickMessage(leadId) {
      const msg = prompt('Message:');
      if (msg) {
        fetch(\`/api/leads/\${leadId}/message\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: msg })
        }).then(() => alert('✅ Sent!'));
      }
    }

    updateStats();
    updateTable();
    setInterval(() => { updateStats(); updateTable(); }, 30000);
  </script>
</body>
</html>`);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('🚀 CRM Dashboard running on port ' + PORT));
