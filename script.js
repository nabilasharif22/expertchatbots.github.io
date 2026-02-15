const form = document.getElementById('debate-form');
const expert1Messages = document.getElementById('expert1-messages');
const expert2Messages = document.getElementById('expert2-messages');
const expert1Name = document.getElementById('expert1-name');
const expert2Name = document.getElementById('expert2-name');
const graphPanel = document.getElementById('graph-panel');

let chart; // Chart.js instance

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function showMessages(exchanges, expert1, expert2) {
  for (let exchange of exchanges) {
    const div = document.createElement('div');
    div.className = 'chat-message';
    div.textContent = exchange.statement;

    // Compare speaker names (case-insensitive)
    if(exchange.speaker.toLowerCase() === expert1.toLowerCase()) {
      expert1Messages.appendChild(div);
    } else if(exchange.speaker.toLowerCase() === expert2.toLowerCase()) {
      expert2Messages.appendChild(div);
    } else {
      // Fallback: alternate based on index
      const allMessages = document.querySelectorAll('.chat-message');
      if(allMessages.length % 2 === 0) {
        expert1Messages.appendChild(div);
      } else {
        expert2Messages.appendChild(div);
      }
    }

    await sleep(200);
    div.classList.add('show');
    await sleep(2000);
  }
}

const LOCAL_BACKEND = 'http://127.0.0.1:5000/debate';
const RENDER_BACKEND = 'https://expertchatbots-backend.onrender.com/debate';
// Always use Render backend for now (CORS issue with local development)
const BACKEND_URL = RENDER_BACKEND;

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Clear previous messages
  expert1Messages.innerHTML = '';
  expert2Messages.innerHTML = '';

  const topic = document.getElementById('topic').value;
  const expert1 = document.getElementById('expert1').value;
  const expert2 = document.getElementById('expert2').value;

  expert1Name.textContent = expert1;
  expert2Name.textContent = expert2;

  // Loading indicator
  const loading1 = document.createElement('div');
  const loading2 = document.createElement('div');
  loading1.textContent = "Thinking...";
  loading2.textContent = "Thinking...";
  loading1.className = "chat-loading";
  loading2.className = "chat-loading";
  expert1Messages.appendChild(loading1);
  expert2Messages.appendChild(loading2);

  try {
    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ topic, expert1, expert2, turns: 4 })
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();

    // Remove loading indicators
    loading1.remove();
    loading2.remove();

    // Handle both old format (debate string) and new format (exchanges array)
    if (data.exchanges && Array.isArray(data.exchanges)) {
      // New format: exchanges array
      await showMessages(data.exchanges, expert1, expert2);
    } else if (data.debate) {
      // Old format: debate string - convert to exchanges
      const messages = data.debate.split('\n\n').filter(msg => msg.trim());
      const exchanges = messages.map((msg, idx) => ({
        speaker: idx % 2 === 0 ? expert1 : expert2,
        statement: msg,
        turn: Math.floor(idx / 2) + 1
      }));
      await showMessages(exchanges, expert1, expert2);
    } else {
      throw new Error('Invalid response format from server');
    }
      throw new Error('Invalid response format from server');
    }

  } catch(err) {
    alert('Error fetching debate: ' + err.message);
    // Remove loading indicators if error occurs
    loading1.remove();
    loading2.remove();
  }
});
