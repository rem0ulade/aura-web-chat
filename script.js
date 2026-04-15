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

const sidebar = document.querySelector('.sidebar');
const sidebarToggle = document.getElementById('sidebar-toggle');

if (sidebarToggle && sidebar) {
  sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });
}

const drawerOverlay = document.getElementById('drawer-overlay');
const drawer = document.getElementById('drawer');
const drawerTitle = document.getElementById('drawer-title');
const drawerContent = document.getElementById('drawer-content');
const drawerClose = document.getElementById('drawer-close');

const drawerContentMap = {
  history: `
    <div class="drawer-section">
      <h3>Chat History</h3>
      <p style="color: var(--text-secondary); margin-top: 12px;">No chat history yet.</p>
    </div>
  `,
  personas: `
    <div class="drawer-section">
      <h3>Personas</h3>
      <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 16px;">
        <div class="persona-option" data-persona="developer" style="padding: 12px 16px; background: var(--bg-tertiary); border-radius: 8px; cursor: pointer; transition: all 0.2s ease;">👨‍💻 Developer</div>
        <div class="persona-option" data-persona="coach" style="padding: 12px 16px; background: var(--bg-tertiary); border-radius: 8px; cursor: pointer; transition: all 0.2s ease;">🏃 Coach</div>
        <div class="persona-option" data-persona="analyst" style="padding: 12px 16px; background: var(--bg-tertiary); border-radius: 8px; cursor: pointer; transition: all 0.2s ease;">📊 Analyst</div>
        <div class="persona-option" data-persona="writer" style="padding: 12px 16px; background: var(--bg-tertiary); border-radius: 8px; cursor: pointer; transition: all 0.2s ease;">✍️ Writer</div>
        <div class="persona-option" data-persona="designer" style="padding: 12px 16px; background: var(--bg-tertiary); border-radius: 8px; cursor: pointer; transition: all 0.2s ease;">🎨 Designer</div>
      </div>
    </div>
  `,
  parameter: `
    <div class="drawer-section">
      <h3>Parameters</h3>
      <div style="margin-top: 16px; display: flex; flex-direction: column; gap: 20px;">
        <div>
          <label style="display: block; margin-bottom: 8px; font-size: 12px; color: var(--text-secondary);">Temperature</label>
          <input type="range" min="0" max="2" step="0.1" value="0.7" style="width: 100%;">
          <span style="font-size: 12px; color: var(--text-muted);">0.7</span>
        </div>
        <div>
          <label style="display: block; margin-bottom: 8px; font-size: 12px; color: var(--text-secondary);">Max Tokens</label>
          <input type="range" min="256" max="4096" step="256" value="2048" style="width: 100%;">
          <span style="font-size: 12px; color: var(--text-muted);">2048</span>
        </div>
        <div>
          <label style="display: block; margin-bottom: 8px; font-size: 12px; color: var(--text-secondary);">Top P</label>
          <input type="range" min="0" max="1" step="0.05" value="0.9" style="width: 100%;">
          <span style="font-size: 12px; color: var(--text-muted);">0.9</span>
        </div>
      </div>
    </div>
  `
};

function openDrawer(drawerId) {
  if (!drawer || !drawerOverlay || !drawerContentMap[drawerId]) return;
  
  const titles = {
    history: 'History',
    personas: 'Personas',
    parameter: 'Parameter'
  };
  
  drawerTitle.textContent = titles[drawerId] || 'Drawer';
  drawerContent.innerHTML = drawerContentMap[drawerId] || '';
  drawerOverlay.classList.add('open');
  drawer.classList.add('open');
  
  document.querySelectorAll('.persona-option').forEach(option => {
    option.addEventListener('click', function() {
      const persona = this.dataset.persona;
      if (persona) {
        selectPersona(persona);
        closeDrawer();
      }
    });
  });
}

function closeDrawer() {
  if (!drawer || !drawerOverlay) return;
  drawerOverlay.classList.remove('open');
  drawer.classList.remove('open');
}

if (drawerOverlay) {
  drawerOverlay.addEventListener('click', closeDrawer);
}

if (drawerClose) {
  drawerClose.addEventListener('click', closeDrawer);
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeDrawer();
  }
});

document.querySelectorAll('.nav-item[data-drawer]').forEach(item => {
  item.addEventListener('click', function() {
    const drawerId = this.dataset.drawer;
    if (drawerId) {
      openDrawer(drawerId);
    }
  });
});