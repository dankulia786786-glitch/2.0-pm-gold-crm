import os
import json
import logging
import requests
import threading
import time
from functools import wraps
from flask import Flask, request, jsonify, Response

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

BOT_TOKEN = os.environ.get("BOT_TOKEN", "8120501279:AAFA5EV0a1dZZumj~7ThoGehz0ow3q1RY54")
ADMIN_ID = os.environ.get("ADMIN_ID", "52504489")

TELEGRAM_URL = f"https://api.telegram.org/bot{BOT_TOKEN}"
VANTAGE_IMAGE = "https://raw.githubusercontent.com/dankulia786786-glitch/2.0-pm-gold-crm/main/vantage.jpg"
PUPRIME_IMAGE = "https://raw.githubusercontent.com/dankulia786786-glitch/2.0-pm-gold-crm/main/puprime.jpg"

# ─── DATA STORAGE ─────────────────────────────────────────────────────────
DATA_DIR = "./data"
USERS_FILE = os.path.join(DATA_DIR, "users.json")

if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)

def load_users():
    try:
        if os.path.exists(USERS_FILE):
            with open(USERS_FILE, "r") as f:
                return json.load(f)
    except Exception as e:
        logger.error(f"Load error: {e}")
    return {}

def save_users(users):
    try:
        with open(USERS_FILE, "w") as f:
            json.dump(users, f, indent=2)
    except Exception as e:
        logger.error(f"Save error: {e}")

users_db = load_users()

# ─── TELEGRAM BOT FUNCTIONS ───────────────────────────────────────────────
def send_message(chat_id, text, keyboard=None):
    """Send text message to user"""
    data = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "HTML"
    }
    if keyboard:
        data["reply_markup"] = json.dumps(keyboard)
    
    r = requests.post(f"{TELEGRAM_URL}/sendMessage", data=data)
    return r.json().get("ok", False)

def send_photo(chat_id, photo_url, caption="", keyboard=None):
    """Send photo to user"""
    data = {
        "chat_id": chat_id,
        "photo": photo_url,
        "caption": caption,
        "parse_mode": "HTML"
    }
    if keyboard:
        data["reply_markup"] = json.dumps(keyboard)
    
    r = requests.post(f"{TELEGRAM_URL}/sendPhoto", data=data)
    return r.json().get("ok", False)

def edit_message(chat_id, message_id, text, keyboard=None):
    """Edit existing message"""
    data = {
        "chat_id": chat_id,
        "message_id": message_id,
        "text": text,
        "parse_mode": "HTML"
    }
    if keyboard:
        data["reply_markup"] = json.dumps(keyboard)
    
    r = requests.post(f"{TELEGRAM_URL}/editMessageText", data=data)
    return r.json().get("ok", False)

# ─── TELEGRAM WEBHOOK ─────────────────────────────────────────────────────
@app.route("/webhook", methods=["POST"])
def webhook():
    """Telegram webhook endpoint"""
    try:
        update = request.get_json()
        
        # Handle /start command
        if "message" in update and update["message"].get("text") == "/start":
            msg = update["message"]
            chat_id = msg["chat"]["id"]
            user_id = msg["from"]["id"]
            first_name = msg["from"].get("first_name", "User")
            username = msg["from"].get("username", "no_username")
            
            user_key = str(user_id)
            if user_key not in users_db:
                users_db[user_key] = {
                    "userId": user_id,
                    "firstName": first_name,
                    "username": username,
                    "chatId": chat_id,
                    "broker": "",
                    "email": "",
                    "mtNumber": "",
                    "status": "pending",
                    "currentStep": "welcome",
                    "createdAt": time.time()
                }
                save_users(users_db)
            
            # Welcome message
            welcome_text = f"""🎉 Welcome, {first_name}! 🎉

🏆 GOLD SIGNALS

Get FREE access to:
✅ VIP Gold Signals — FREE
✅ 50% Deposit Bonus for Life — FREE & Uncapped
✅ Free Vantage Trading Course

⏱️ Takes less than 2 minutes to complete.

👇 Tap below to get started."""
            
            keyboard = {
                "inline_keyboard": [
                    [{"text": "🚀 Let's get you set up.", "callback_data": "start_setup"}]
                ]
            }
            
            send_message(chat_id, welcome_text, keyboard)
            
            # Admin notification
            admin_msg = f"""🆕 NEW LEAD STARTED!

👤 Name: {first_name}
🔗 Username: @{username}
🆔 User ID: {user_id}

Status: Just started"""
            send_message(ADMIN_ID, admin_msg)
        
        # Handle callback queries (button clicks)
        if "callback_query" in update:
            query = update["callback_query"]
            chat_id = query["message"]["chat"]["id"]
            message_id = query["message"]["message_id"]
            user_id = query["from"]["id"]
            data = query["data"]
            
            user_key = str(user_id)
            if user_key not in users_db:
                return jsonify({"ok": True})
            
            user = users_db[user_key]
            
            # START SETUP
            if data == "start_setup":
                user["currentStep"] = "broker_choice"
                broker_text = "🏦 Please select the broker you're currently using:"
                keyboard = {
                    "inline_keyboard": [
                        [{"text": "🔵 Vantage", "callback_data": "choose_vantage"}],
                        [{"text": "🔴 PU Prime", "callback_data": "choose_puprime"}]
                    ]
                }
                edit_message(chat_id, message_id, broker_text, keyboard)
            
            # CHOOSE VANTAGE
            elif data == "choose_vantage":
                user["broker"] = "Vantage"
                user["currentStep"] = "vantage_steps"
                
                vantage_text = """🚀 Complete the steps below to activate your FREE Premium Group access. (Takes 10s)

1️⃣ Log-in to your Vantage client portal:
👇 https://secure.vantagemarkets.com/logout?lang=en_US

2️⃣ Fill the Form 📋
👇 https://secure.vantagemarkets.com/profile/transfer-ib-affiliate

3️⃣ Enter the following details exactly as shown:
✅ Partnership Type: IB
✅ IB Code: 58576
✅ Reason: PM

🚨 IMPORTANT
🚫 Please close all open positions before initiating the transfer.
🚫 Wait for the confirmation email before placing any new trades.

👇 Once completed, click the button below."""
                
                keyboard = {
                    "inline_keyboard": [
                        [{"text": "✅ DONE", "callback_data": "vantage_done"}]
                    ]
                }
                
                edit_message(chat_id, message_id, vantage_text, keyboard)
                admin_msg = f"📌 Lead chose VANTAGE\n👤 {user['firstName']}\n🏢 Vantage"
                send_message(ADMIN_ID, admin_msg)
            
            # CHOOSE PU PRIME
            elif data == "choose_puprime":
                user["broker"] = "PU Prime"
                user["currentStep"] = "puprime_steps"
                
                puprime_text = """🚀 Complete the steps below to activate your FREE Premium Group access. (Takes 10s)

1️⃣ Log-in to your PU Prime Client Portal
👇 https://myaccount.puprime.com/home

2️⃣ Open the IB Transfer Form
👇 https://myaccount.puprime.com/profile/transfer-ib-affiliate

3️⃣ Enter the following details exactly as shown:
✅ Partnership Type: IB
✅ IB Code: 50151
✅ Reason: PM

🚨 IMPORTANT
🚫 Please close all open positions before initiating the transfer.
🚫 Wait for the confirmation email before placing any new trades.

👇 Once completed, click the button below."""
                
                keyboard = {
                    "inline_keyboard": [
                        [{"text": "✅ DONE", "callback_data": "puprime_done"}]
                    ]
                }
                
                edit_message(chat_id, message_id, puprime_text, keyboard)
                admin_msg = f"📌 Lead chose PU PRIME\n👤 {user['firstName']}\n🏢 PU Prime"
                send_message(ADMIN_ID, admin_msg)
            
            # VANTAGE DONE
            elif data == "vantage_done":
                user["currentStep"] = "email_input"
                email_text = "🎉 Almost there!\n\nPlease enter your Vantage email or MT4/MT5 number below:"
                edit_message(chat_id, message_id, email_text)
                admin_msg = f"📧 Vantage lead waiting for email/MT\n👤 {user['firstName']}"
                send_message(ADMIN_ID, admin_msg)
            
            # PU PRIME DONE
            elif data == "puprime_done":
                user["currentStep"] = "email_input"
                email_text = "🎉 Almost there!\n\nPlease enter your PU Prime email or MT4/MT5 number below:"
                edit_message(chat_id, message_id, email_text)
                admin_msg = f"📧 PU Prime lead waiting for email/MT\n👤 {user['firstName']}"
                send_message(ADMIN_ID, admin_msg)
            
            save_users(users_db)
        
        # Handle text input (email/MT number)
        if "message" in update and "text" in update["message"]:
            msg = update["message"]
            if not msg["text"].startswith("/"):
                chat_id = msg["chat"]["id"]
                user_id = msg["from"]["id"]
                text = msg["text"]
                
                user_key = str(user_id)
                if user_key in users_db:
                    user = users_db[user_key]
                    
                    if user["currentStep"] == "email_input":
                        if "@" in text or text.isdigit():
                            user["email"] = text if "@" in text else ""
                            user["mtNumber"] = text if text.isdigit() else ""
                            user["status"] = "completed"
                            user["currentStep"] = "completed"
                            
                            confirm_text = """✅ Thank you!

Your information has been received.

🎁 You now have FREE access to our Premium Group!

Welcome to GOLD SIGNALS! 🚀"""
                            send_message(chat_id, confirm_text)
                            
                            admin_msg = f"""✅ LEAD COMPLETED!

👤 {user['firstName']}
🏢 Broker: {user['broker']}
📧 Email/MT: {user['email'] or user['mtNumber']}

Ready to follow up!"""
                            send_message(ADMIN_ID, admin_msg)
                            
                            save_users(users_db)
                        else:
                            send_message(chat_id, "❌ Please enter a valid email or MT4/MT5 number.")
        
    except Exception as e:
        logger.error(f"Webhook error: {e}")
    
    return jsonify({"ok": True})

# ─── DASHBOARD APIS ───────────────────────────────────────────────────────
@app.route("/api/stats", methods=["GET"])
def api_stats():
    total = len(users_db)
    done = sum(1 for u in users_db.values() if u.get("status") == "completed")
    pending = total - done
    vantage = sum(1 for u in users_db.values() if u.get("broker") == "Vantage")
    puprime = sum(1 for u in users_db.values() if u.get("broker") == "PU Prime")
    
    return jsonify({"total": total, "done": done, "pending": pending, "vantage": vantage, "puprime": puprime})

@app.route("/api/leads", methods=["GET"])
def api_leads():
    leads = []
    for i, (uid, user) in enumerate(users_db.items()):
        leads.append({
            "id": i + 1,
            "name": user.get("firstName", ""),
            "username": user.get("username", ""),
            "broker": user.get("broker", ""),
            "mt5": user.get("mtNumber", ""),
            "status": user.get("status", "pending"),
            "progress": 5 if user.get("status") == "completed" else 3,
            "lastSeen": "now",
            "drip": 0
        })
    return jsonify(leads)

@app.route("/api/broadcast", methods=["POST"])
def api_broadcast():
    data = request.get_json()
    text = data.get("text", "")
    
    sent = 0
    for user in users_db.values():
        if user.get("status") != "completed":
            send_message(user.get("chatId"), text)
            sent += 1
    
    return jsonify({"ok": True, "sent": sent})

# ─── DASHBOARD HTML ───────────────────────────────────────────────────────
@app.route("/", methods=["GET"])
def dashboard():
    return """<!DOCTYPE html>
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
      margin-bottom: 25px;
      border-bottom: 2px solid #ffc700;
      padding-bottom: 15px;
    }
    .header h1 { color: #ffc700; font-size: 28px; }
    .header p { color: #999; font-size: 13px; }
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
    .stat-num { font-size: 32px; font-weight: bold; }
    .stat-label { font-size: 11px; color: #999; margin-top: 3px; }
    .broadcast {
      background: #0f3460;
      border: 1px solid #16213e;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 25px;
    }
    textarea {
      width: 100%;
      padding: 10px;
      background: #1a2a4a;
      border: 1px solid #16213e;
      border-radius: 6px;
      color: #e0e0e0;
      margin-bottom: 10px;
      min-height: 80px;
    }
    .btn {
      padding: 10px 20px;
      background: #ffc700;
      color: #000;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: bold;
      width: 100%;
    }
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
      color: #ffc700;
      font-weight: 600;
    }
    td {
      padding: 8px 10px;
      border-bottom: 1px solid #1a2a4a;
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
    </div>

    <div class="stats">
      <div class="stat"><div class="stat-num" id="total">0</div><div class="stat-label">Total</div></div>
      <div class="stat"><div class="stat-num" id="done">0</div><div class="stat-label">Done</div></div>
      <div class="stat"><div class="stat-num" id="pending">0</div><div class="stat-label">Pending</div></div>
      <div class="stat"><div class="stat-num" id="vantage">0</div><div class="stat-label">Vantage</div></div>
      <div class="stat"><div class="stat-num" id="puprime">0</div><div class="stat-label">PU Prime</div></div>
    </div>

    <div class="broadcast">
      <h3>📢 Broadcast Message</h3>
      <textarea id="msg" placeholder="Your message..."></textarea>
      <button class="btn" onclick="broadcast()">Send Broadcast</button>
    </div>

    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>#</th><th>Name</th><th>Username</th><th>Broker</th><th>MT5</th><th>Status</th>
          </tr>
        </thead>
        <tbody id="tbody"></tbody>
      </table>
    </div>
  </div>

  <script>
    function load() {
      fetch('/api/stats').then(r => r.json()).then(d => {
        document.getElementById('total').innerText = d.total;
        document.getElementById('done').innerText = d.done;
        document.getElementById('pending').innerText = d.pending;
        document.getElementById('vantage').innerText = d.vantage;
        document.getElementById('puprime').innerText = d.puprime;
      });

      fetch('/api/leads').then(r => r.json()).then(leads => {
        const html = leads.map((l, i) => `<tr><td>${i+1}</td><td>${l.name}</td><td>${l.username || '-'}</td><td>${l.broker || '-'}</td><td>${l.mt5 || '-'}</td><td>${l.status}</td></tr>`).join('');
        document.getElementById('tbody').innerHTML = html;
      });
    }

    function broadcast() {
      const msg = document.getElementById('msg').value;
      if (!msg) { alert('Enter message'); return; }
      fetch('/api/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: msg })
      }).then(() => {
        alert('✅ Broadcast sent!');
        document.getElementById('msg').value = '';
        load();
      });
    }

    load();
    setInterval(load, 30000);
  </script>
</body>
</html>"""

@app.route("/", methods=["GET"])
def health():
    total = len(users_db)
    completed = sum(1 for u in users_db.values() if u.get("status") == "completed")
    return f"✅ Kevin VIP Bot Running!\nTotal leads: {total} | Completed: {completed}"

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port, debug=False)
