const form = document.getElementById('debate-form');
const expert1Messages = document.getElementById('expert1-messages');
const expert2Messages = document.getElementById('expert2-messages');
const expert1Name = document.getElementById('expert1-name');
const expert2Name = document.getElementById('expert2-name');

let chart; // Chart.js instance

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

  try {
    const response = await fetch('https://expertchatbots-backend.onrender.com', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ topic, expert1, expert2 })
    });

    const data = await response.json();

    // Split debate into left/right messages
    const messages = data.debate.split('\n\n');
    messages.forEach(msg => {
      if(msg.toLowerCase().includes(expert1.toLowerCase())) {
        const div = document.createElement('div');
        div.className = 'chat-message chat-left';
        div.textContent = msg;
        expert1Messages.appendChild(div);
      } else {
        const div = document.createElement('div');
        div.className = 'chat-message chat-right';
        div.textContent = msg;
        expert2Messages.appendChild(div);
      }
    });

    // Render chart
    const ctx = document.getElementById('debateChart').getContext('2d');
    if(chart) chart.destroy(); // remove old chart
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

  } catch(err) {
    alert('Error fetching debate: ' + err.message);
  }
});
