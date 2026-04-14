const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

let currentPersona = 'general';
let selectedPersona = null;

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
    <div class="message-avatar">
      <span>${avatar}</span>
    </div>
    <div class="message-content">
      <div class="message-text">${escapeHtml(text)}</div>
      <div class="message-time">${time}</div>
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
    <div class="message-avatar">
      <span>✦</span>
    </div>
    <div class="message-content">
      <div class="typing-indicator">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
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

async function getAiResponse(message, persona) {
  return new Promise(resolve => {
    setTimeout(() => {
      let response = '';
      switch(persona) {
        case 'developer':
          response = `[Developer Persona] Ich helfe dir bei Code-Fragen. Deine Frage: "${escapeHtml(message)}"`;
          break;
        case 'coach':
          response = `[Coach Persona] Ich helfe dir bei persönlicher Entwicklung. Deine Frage: "${escapeHtml(message)}"`;
          break;
        case 'analyst':
          response = `[Analyst Persona] Ich helfe dir bei Datenanalyse. Deine Frage: "${escapeHtml(message)}"`;
          break;
        case 'writer':
          response = `[Writer Persona] Ich helfe dir beim Schreiben. Deine Frage: "${escapeHtml(message)}"`;
          break;
        case 'designer':
          response = `[Designer Persona] Ich helfe dir bei Design-Fragen. Deine Frage: "${escapeHtml(message)}"`;
          break;
        default:
          response = `Das ist eine simulierte Antwort auf: ${escapeHtml(message)}`;
      }
      resolve(response);
    }, 1000);
  });
}

function selectPersona(persona) {
  currentPersona = persona;
  selectedPersona = persona;
  
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });
  
  const personaItem = document.querySelector(`.nav-item[data-persona="${persona}"]`);
  if (personaItem) {
    personaItem.classList.add('active');
  }
  
  const chatTitle = document.querySelector('.chat-title h1');
  if (chatTitle) {
    const personaNames = {
      'developer': 'Developer',
      'coach': 'Coach',
      'analyst': 'Analyst',
      'writer': 'Writer',
      'designer': 'Designer',
      'general': 'Chat'
    };
    chatTitle.textContent = personaNames[persona] || 'Chat';
  }
  
  const modelBadge = document.querySelector('.model-badge');
  if (modelBadge) {
    modelBadge.textContent = persona === 'general' ? 'GPT-4o' : `@${persona}`;
  }
  
  addMessage(`Persona gewechselt zu @${persona}`, 'ai');
}

sendButton.addEventListener('click', async () => {
  const messageText = userInput.value.trim();
  if (messageText === '') return;

  addMessage(messageText, 'user');
  userInput.value = '';
  userInput.style.height = 'auto';

  showTypingIndicator();
  
  try {
    const aiResponse = await getAiResponse(messageText, currentPersona);
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
    const persona = this.dataset.persona;
    if (persona) {
      selectPersona(persona);
    } else {
      document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
      this.classList.add('active');
    }
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const chatBox = document.getElementById('chat-box');
  chatBox.scrollTop = chatBox.scrollHeight;
});