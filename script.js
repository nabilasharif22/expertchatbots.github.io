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

// Animate messages one by one
async function showMessages(messages, expert1, expert2) {
  for (let msg of messages) {
    const div = document.createElement('div');
    div.className = 'chat-message';
    div.textContent = msg;

    if(msg.toLowerCase().includes(expert1.toLowerCase())) {
      expert1Messages.appendChild(div);
    } else {
      expert2Messages.appendChild(div);
    }

    await sleep(100); // fade-in trigger
    div.classList.add('show');
    await sleep(400); // delay between messages
  }
}

// Automatically switch backend URL depending on environment
const LOCAL_BACKEND = 'http://127.0.0.1:5000/debate';
const RENDER_BACKEND = 'https://expertchatbots-backend.onrender.com/debate';
const BACKEND_URL = window.location.hostname.includes('github.io') ? RENDER_BACKEND : LOCAL_BACKEND;

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Clear previous messages and hide chart
  expert1Messages.innerHTML = '';
  expert2Messages.innerHTML = '';
  graphPanel.style.opacity = 0;

  const topic = document.getElementById('topic').value;
  const expert1 = document.getElementById('expert1').value;
  const expert2 = document.getElementById('expert2').value;

  expert1Name.textContent = expert1;
  expert2Name.textContent = expert2;

  try {
    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ topic, expert1, expert2 })
    });

    // Check if response is JSON
    const text = await response.text();
    if(!text || text[0] === '<') {
      throw new Error('Received HTML instead of JSON. Check backend URL or endpoint.');
    }
    const data = JSON.parse(text);

    const messages = data.debate.split('\n\n');
    await showMessages(messages, expert1, expert2);

    // Render chart
    const ctx = document.getElementById('debateChart').getContext('2d');
    if(chart) chart.destroy();
    chart = new Chart(ctx, {
      type: data.figure.type,
      data: {
        labels: data.figure.labels,
        datasets: [{
          label: 'Research Evidence',
          data: data.figure.values,
          backgroundColor: ['#2b2d42', '#ef233c']
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
      }
    });

    // Fade in chart panel
    graphPanel.style.opacity = 1;

  } catch(err) {
    alert('Error fetching debate: ' + err.message);
  }
});
