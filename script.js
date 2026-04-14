const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

function getCurrentTime() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

function addMessage(text, sender) {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message', sender === 'user' ? 'user-message' : 'ai-message');
  
  const avatar = sender === 'ai' ? '✦' : 'U';
  const time = getCurrentTime();
  
  messageElement.innerHTML = `
    <div class=message-avatar>
      <span>${avatar}</span>
    </div>
    <div class=message-content>
      <div class=message-text>${escapeHtml(text)}</div>
      <div class=message-time>${time}</div>
    </div>
  `;
  
  chatBox.appendChild(messageElement);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showTypingIndicator() {
  const indicator = document.createElement('div');
  indicator.classList.add('message', 'ai-message');
  indicator.id = 'typing-indicator';
  indicator.innerHTML = `
    <div class=message-avatar>
      <span>✦</span>
    </div>
    <div class=message-content>
      <div class=typing-indicator>
        <span class=typing-dot></span>
        <span class=typing-dot></span>
        <span class=typing-dot></span>
      </div>
    </div>
  `;
  chatBox.appendChild(indicator);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function removeTypingIndicator() {
  const indicator = document.getElementById('typing-indicator');
  if (indicator) {
    indicator.remove();
  }
}

async function getAiResponse(message) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(`Das ist eine simulierte Antwort auf: ${escapeHtml(message)}`);
    }, 1000);
  });
}

sendButton.addEventListener('click', async () => {
  const messageText = userInput.value.trim();
  if (messageText === '') return;

  addMessage(messageText, 'user');
  userInput.value = '';
  userInput.style.height = 'auto';

  showTypingIndicator();
  
  try {
    const aiResponse = await getAiResponse(messageText);
    removeTypingIndicator();
    addMessage(aiResponse, 'ai');
  } catch (error) {
    removeTypingIndicator();
    addMessage('Entschuldigung, es ist ein Fehler aufgetreten.', 'ai');
  }
});

userInput.addEventListener('keypress', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendButton.click();
  }
});

userInput.addEventListener('input', function() {
  this.style.height = 'auto';
  this.style.height = Math.min(this.scrollHeight, 120) + 'px';
});

document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', function() {
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    this.classList.add('active');
  });
});