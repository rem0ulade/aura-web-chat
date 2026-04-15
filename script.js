const STORAGE_KEY = "aura-desktop-state-v1";

const screenRoot = document.getElementById("screen-root");
const screenTitle = document.getElementById("screen-title");
const screenKicker = document.getElementById("screen-kicker");
const headerActions = document.getElementById("header-actions");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("mobile-overlay");
const menuToggle = document.getElementById("menu-toggle");
const mobileClose = document.getElementById("mobile-close");

const defaultState = {
  activeScreen: "chat",
  chatMessages: [],
  input: "",
  personasActive: ["reise", "developer", "ernaehrung"],
  memoryFilter: "all",
  skillFilter: "all",
  toggles: {
    live: true,
    tokenCounter: true,
    autosave: true,
    kidsMode: false,
    explicit: false,
    agentActive: true,
    weather: true,
    gmail: false,
    gcal: false,
    notion: true,
    heartbeat: true
  },
  temperature: 0.7
};

let state = loadState();

const screenMeta = {
  chat: { title: "Chat", kicker: "AURA" },
  history: { title: "Historie", kicker: "Navigation" },
  projects: { title: "Projekte", kicker: "Navigation" },
  newChat: { title: "Neuer Chat", kicker: "Navigation" },
  personas: { title: "Personas", kicker: "Aura" },
  memory: { title: "Memories", kicker: "Aura" },
  skills: { title: "Skills", kicker: "Aura" },
  agent: { title: "Agent", kicker: "Aura" },
  parameter: { title: "Modell", kicker: "Aura" },
  apiConnectors: { title: "API & Konnektoren", kicker: "Einstellungen" },
  systemPrompt: { title: "Assistenten-Verhalten", kicker: "Einstellungen" },
  preferred: { title: "Praeferenzen", kicker: "Einstellungen" },
  general: { title: "Allgemein", kicker: "Einstellungen" },
  dangerzone: { title: "Gefahrenzone", kicker: "Einstellungen" }
};

const handlers = {
  chat: renderChat,
  history: renderHistory,
  projects: renderProjects,
  newChat: renderNewChat,
  personas: renderPersonas,
  memory: renderMemory,
  skills: renderSkills,
  agent: renderAgent,
  parameter: renderParameter,
  apiConnectors: renderApi,
  systemPrompt: renderSystemPrompt,
  preferred: renderPreferred,
  general: renderGeneral,
  dangerzone: renderDangerzone
};

document.querySelectorAll(".nav-item").forEach((btn) => {
  btn.addEventListener("click", () => {
    activateScreen(btn.dataset.screen || "chat");
    closeMobileMenu();
  });
});

menuToggle?.addEventListener("click", openMobileMenu);
mobileClose?.addEventListener("click", closeMobileMenu);
overlay?.addEventListener("click", closeMobileMenu);

activateScreen(state.activeScreen);

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(defaultState);
    return { ...structuredClone(defaultState), ...JSON.parse(raw) };
  } catch {
    return structuredClone(defaultState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function activateScreen(screen) {
  state.activeScreen = handlers[screen] ? screen : "chat";
  saveState();
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.toggle("is-active", item.dataset.screen === state.activeScreen);
  });
  renderActiveScreen();
}

function renderActiveScreen() {
  const meta = screenMeta[state.activeScreen];
  const renderFn = handlers[state.activeScreen];
  screenTitle.textContent = meta.title;
  screenKicker.textContent = meta.kicker;
  renderHeaderActions(state.activeScreen);
  screenRoot.innerHTML = renderFn();
  wireScreenEvents();
}

function renderHeaderActions(screen) {
  if (screen === "chat" || screen === "history") {
    headerActions.innerHTML = `
      <button class="icon-btn" title="Ordner">F</button>
      <button class="action-btn" data-new-item>+ Neu</button>
    `;
    return;
  }
  if (["parameter", "apiConnectors", "preferred", "agent", "systemPrompt"].includes(screen)) {
    headerActions.innerHTML = `<button class="action-btn" data-save>Sichern</button>`;
    return;
  }
  headerActions.innerHTML = "";
}

function wireScreenEvents() {
  screenRoot.querySelectorAll("[data-toggle]").forEach((el) => {
    el.addEventListener("click", () => {
      const key = el.dataset.toggle;
      state.toggles[key] = !state.toggles[key];
      saveState();
      renderActiveScreen();
    });
  });

  screenRoot.querySelectorAll("[data-chip-group]").forEach((el) => {
    el.addEventListener("click", () => {
      const group = el.dataset.chipGroup;
      const value = el.dataset.chipValue;
      if (group === "memory") state.memoryFilter = value;
      if (group === "skills") state.skillFilter = value;
      saveState();
      renderActiveScreen();
    });
  });

  screenRoot.querySelectorAll("[data-persona]").forEach((el) => {
    el.addEventListener("click", () => {
      const key = el.dataset.persona;
      if (state.personasActive.includes(key)) {
        state.personasActive = state.personasActive.filter((entry) => entry !== key);
      } else {
        state.personasActive = [...state.personasActive, key];
      }
      saveState();
      renderActiveScreen();
    });
  });

  const tempSlider = screenRoot.querySelector("#temperature-range");
  if (tempSlider) {
    tempSlider.addEventListener("input", (e) => {
      state.temperature = Number(e.target.value);
      saveState();
      const out = screenRoot.querySelector("#temperature-value");
      if (out) out.textContent = state.temperature.toFixed(1);
    });
  }

  const chatForm = screenRoot.querySelector("#chat-form");
  const chatInput = screenRoot.querySelector("#chat-input");
  if (chatInput) {
    chatInput.value = state.input;
    chatInput.addEventListener("input", (e) => {
      state.input = e.target.value;
      saveState();
      e.target.style.height = "auto";
      e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
    });
    chatInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        chatForm?.requestSubmit();
      }
    });
  }
  chatForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    submitMessage();
  });
}

function submitMessage() {
  const text = state.input.trim();
  if (!text) return;
  const time = new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
  state.chatMessages.push({ role: "user", text, time });
  state.chatMessages.push({
    role: "ai",
    text: `Verstanden. Ich simuliere Aura-Desktop und habe aufgenommen: "${text}"`,
    time
  });
  state.input = "";
  saveState();
  renderActiveScreen();
}

function toggleClass(isOn) {
  return `toggle${isOn ? " is-on" : ""}`;
}

function renderChat() {
  const hasMessages = state.chatMessages.length > 0;
  return `
    <div class="chat-layout">
      <div class="chat-empty"${hasMessages ? ' style="display:none"' : ""}>
        <div>
          <h2>AU<span>R</span>A</h2>
          <p>Schoen dich zu sehen, Jona</p>
          <div class="suggestion-pills">
            <button class="chip">E-Mail formulieren</button>
            <button class="chip">Code erklaeren</button>
            <button class="chip">Reise planen</button>
            <button class="chip">Etwas recherchieren</button>
          </div>
        </div>
      </div>
      <div class="message-list"${hasMessages ? ' style="display:flex"' : ""}>
        ${state.chatMessages
          .map((msg) => `<article class="msg ${msg.role}"><strong>${msg.role === "user" ? "Du" : "Aura"}:</strong> ${escapeHtml(msg.text)}<div class="hint">${msg.time}</div></article>`)
          .join("")}
      </div>
      <form id="chat-form" class="stack">
        <div class="card card-body">
          <input class="input" value="" placeholder="Tippe fuer / Skills, @Persona, + Anhaenge, Voice" readonly>
        </div>
        <div class="chat-input-shell">
          <button type="button" class="icon-btn">+</button>
          <textarea id="chat-input" class="chat-textarea" rows="1" placeholder="Nachricht schreiben..."></textarea>
          <button type="submit" class="action-btn">Senden</button>
        </div>
        <div class="hint" style="text-align:center">Antworten pruefen. Aura kann Fehler machen.</div>
      </form>
    </div>
  `;
}

function renderHistory() {
  const entries = ["Aura!", ":)", "Hallo", "Hallie", "Was siehst du?", "Mein Name ist Jonathan"];
  return `
    <div class="stack">
      <div class="card card-body history-list">
        ${entries
          .map((text, idx) => `
            <article class="history-item">
              <div class="history-item-left">
                <span class="dot-avatar">${text[0]}</span>
                <div>
                  <div class="row-title">${text}</div>
                  <div class="green">aura-pro</div>
                </div>
              </div>
              <div style="display:flex;align-items:center;gap:10px">
                <span class="hint">${14 - idx}. Apr.</span>
                <button class="plus-round">+</button>
              </div>
            </article>
          `)
          .join("")}
      </div>
    </div>
  `;
}

function renderProjects() {
  return `
    <div class="stack">
      <div class="card">
        <div class="card-header">Projekte</div>
        <div class="card-body hint">
          Projektverwaltung wird als naechstes Modul ausgebaut. Du kannst bereits Navigation und globale UI testen.
        </div>
      </div>
    </div>
  `;
}

function renderNewChat() {
  return `
    <div class="stack">
      <div class="card">
        <div class="card-header">Neuer Chat</div>
        <div class="card-body stack">
          <input class="input" placeholder="Titel optional">
          <textarea class="textarea" placeholder="Startprompt eingeben"></textarea>
          <button class="action-btn" style="width:max-content">Chat erstellen</button>
        </div>
      </div>
    </div>
  `;
}

function renderPersonas() {
  const personas = [
    ["reise", "Reiseplaner"],
    ["developer", "Developer"],
    ["ernaehrung", "Ernaehrungscoach"],
    ["nachhilfe", "Nachhilfe"],
    ["study", "Study Buddy"],
    ["sport", "Sportcoach"],
    ["creator", "Content Creator"],
    ["pflanzen", "Pflanzen-Experte"]
  ];

  return `
    <div class="stack">
      <div class="card card-body hint">
        Aktiviere Personas und sprich sie im Chat mit <span class="green">@Name</span> an.
      </div>
      <div class="toolbar">
        <div class="chip-row">
          <button class="chip is-active">Alle</button>
          <button class="chip">Aktiv (${state.personasActive.length})</button>
        </div>
        <span class="chip is-active">${state.personasActive.length} aktiv</span>
      </div>
      <div class="persona-grid">
        ${personas
          .map(([key, label]) => {
            const active = state.personasActive.includes(key);
            return `
              <article class="mini-card${active ? " active" : ""}">
                <div class="mini-card-title">${label}</div>
                <div style="display:flex;justify-content:space-between;align-items:center">
                  <div class="chip-row">
                    <button class="chip">Einst.</button>
                    <button class="chip">Info</button>
                  </div>
                  <button class="${toggleClass(active)}" data-persona="${key}" aria-label="${label} umschalten"></button>
                </div>
              </article>
            `;
          })
          .join("")}
      </div>
      <button class="card card-body action-btn">+ Eigene Persona erstellen</button>
    </div>
  `;
}

function renderMemory() {
  const chips = [
    ["all", "Alle"],
    ["personal", "Persoenlich"],
    ["like", "Vorlieben"],
    ["work", "Arbeit"]
  ];
  return `
    <div class="stack">
      <div class="stat-bar">
        <div class="stat"><div class="stat-value">2</div><div class="stat-label">Gesamt</div></div>
        <div class="stat"><div class="stat-value green">2</div><div class="stat-label">Auto-erkannt</div></div>
        <div class="stat"><div class="stat-value">0</div><div class="stat-label">Manuell</div></div>
        <div class="stat"><div class="stat-value red">Alle loeschen</div><div class="stat-label">Action</div></div>
      </div>
      <div class="chip-row">
        ${chips
          .map(([value, label]) => `<button class="chip ${state.memoryFilter === value ? "is-active" : ""}" data-chip-group="memory" data-chip-value="${value}">${label}</button>`)
          .join("")}
      </div>
      ${["Der Name des Benutzers ist Jonathan", "User heisst Jonathan"].map((text) => `
        <article class="card card-body stack">
          <div class="toolbar">
            <span class="chip is-active">Persoenlich</span>
            <span class="hint"><span class="green">+ Auto</span> 13. Apr.</span>
          </div>
          <div class="row-title">${text}</div>
          <div class="split">
            <button class="chip" style="border-radius:10px">Bearbeiten</button>
            <button class="chip red" style="border-radius:10px">Loeschen</button>
          </div>
        </article>
      `).join("")}
    </div>
  `;
}

function renderSkills() {
  const skills = [
    "Self-Improving Core",
    "MemPalace Core",
    "Zusammenfasser",
    "E-Mail Schreiber",
    "Code Reviewer",
    "Uebersetzer"
  ];
  const chips = [["all", "Alle"], ["prod", "Produktivitaet"], ["comm", "Kommunikation"], ["data", "Daten"]];
  return `
    <div class="stack">
      <div class="card card-body hint">
        <strong class="green">Skills</strong> sind kleine Helfer fuer bestimmte Aufgaben. Diese Ansicht orientiert sich am nativen Aura-Screen.
      </div>
      <input class="search" placeholder="Suchen...">
      <div class="chip-row">
        ${chips.map(([value, label]) => `<button class="chip ${state.skillFilter === value ? "is-active" : ""}" data-chip-group="skills" data-chip-value="${value}">${label}</button>`).join("")}
      </div>
      <div class="skills-grid">
        ${skills.map((skill, index) => `
          <article class="mini-card ${index < 2 ? "active" : ""}">
            <div class="mini-card-title">${skill}</div>
            <div class="hint">${index < 2 ? "Immer an" : "Kurzbeschreibung fuer den Skill im Aura-Stil."}</div>
            <div class="toolbar">
              <span class="green">${index % 2 === 0 ? "Produktivitaet" : "Kommunikation"}</span>
              <span class="chip ${index < 2 ? "is-active" : ""}">${index < 2 ? "CORE" : "AN"}</span>
            </div>
          </article>
        `).join("")}
      </div>
    </div>
  `;
}

function renderParameter() {
  return `
    <div class="stack">
      <section class="card">
        <div class="card-header">Aktuelles Modell</div>
        <div class="row">
          <div><div class="row-title">Auto - Free</div><div class="row-sub">OpenRouter - Kontext: 256k</div></div>
          <span class="hint">&gt;</span>
        </div>
      </section>
      <section class="card">
        <div class="card-header">Antwort-Verhalten</div>
        <div class="card-body stack">
          <div>
            <div class="row-title">Kreativitaet (Temperature)</div>
            <div class="hint">Steuert, wie vorhersehbar oder ueberraschend die Antworten sind.</div>
          </div>
          <div class="row">
            <span class="hint">Praezise</span>
            <input id="temperature-range" type="range" min="0" max="2" step="0.1" value="${state.temperature}">
            <span class="hint">Kreativ</span>
            <strong class="green" id="temperature-value">${state.temperature.toFixed(1)}</strong>
          </div>
          <div class="row"><div class="row-title">Antwortlaenge (Max Tokens)</div><span class="hint">2500</span></div>
          <div class="row"><div class="row-title">Gespraechsverlauf</div><span class="hint">10</span></div>
        </div>
      </section>
      <section class="card">
        <div class="card-header">Parameter</div>
        <div class="row">
          <div><div class="row-title">Self-Improving Heartbeat</div><div class="hint">Aktiv - Hintergrundlaeufe eingeschaltet</div></div>
          <button class="${toggleClass(state.toggles.heartbeat)}" data-toggle="heartbeat"></button>
        </div>
      </section>
      <section class="card">
        <div class="card-header">Darstellung</div>
        <div class="row"><div><div class="row-title">Live-Antworten</div><div class="hint">Text waehrend der Erstellung anzeigen</div></div><button class="${toggleClass(state.toggles.live)}" data-toggle="live"></button></div>
        <div class="row"><div><div class="row-title">Token-Zaehler</div><div class="hint">Zeigt den KI-Verbrauch im Chat</div></div><button class="${toggleClass(state.toggles.tokenCounter)}" data-toggle="tokenCounter"></button></div>
      </section>
    </div>
  `;
}

function renderApi() {
  return `
    <div class="stack">
      <section class="card">
        <div class="card-header">API Keys</div>
        ${apiRow("OpenRouter", "Alle Modelle - optional (Fortgeschritten)") }
        ${apiRow("OpenAI", "Direktzugriff auf OpenAI-Modelle")}
        ${apiRow("Anthropic", "Direktzugriff auf Claude-Modelle")}
      </section>
      <section class="card">
        <div class="card-header">Konnektoren</div>
        ${connectorRow("Wetter", "Aktuelles Wetter & Vorhersagen", "weather")}
        ${connectorRow("Gmail", "E-Mails lesen, schreiben & verwalten", "gmail")}
        ${connectorRow("Google Kalender", "Termine anzeigen, erstellen & verwalten", "gcal")}
        ${connectorRow("Notion", "Seiten lesen, erstellen & Datenbanken abfragen", "notion")}
      </section>
    </div>
  `;
}

function renderAgent() {
  return `
    <div class="stack">
      <div class="card card-body hint">
        <span class="green">Agent</span> ist dein Hintergrund-Assistent fuer automatische Checks und geplante Aufgaben.
      </div>
      <section class="card">
        <div class="row">
          <div><div class="row-title">Agent aktiv</div><div class="hint">Prueft alle 30 Min. im Hintergrund</div></div>
          <button class="${toggleClass(state.toggles.agentActive)}" data-toggle="agentActive"></button>
        </div>
      </section>
      <section class="card">
        <div class="card-header">Ueberwachen</div>
        ${connectorRow("Wichtige E-Mails", "Benachrichtigung bei wichtigen Absendern", "gmail")}
        ${connectorRow("Kalender-Erinnerungen", "Erinnert vor Terminen", "gcal")}
        ${connectorRow("Tages-Briefing", "Morgens ein persoenliches Briefing", "weather")}
        ${connectorRow("Geplante Skills", "Skills nach Zeitplan ausfuehren", "heartbeat")}
      </section>
    </div>
  `;
}

function renderSystemPrompt() {
  return `
    <div class="stack">
      <div class="card card-body hint">
        <span class="green">Zusatz-Prompt</span><br>
        Hier kannst du Aura einen zusaetzlichen Kontext geben. Der Basis-Prompt bleibt aktiv.
      </div>
      <section class="card">
        <div class="card-header">Dein Zusatz-Prompt</div>
        <div class="card-body stack">
          <textarea class="textarea" placeholder="z.B. Ich bin Software-Entwickler und arbeite mit React Native. Gib mir immer Codebeispiele."></textarea>
          <button class="chip red" style="width:max-content">Zusatz-Prompt leeren</button>
        </div>
      </section>
      <section class="card">
        <div class="card-header">Schnellvorlagen</div>
        ${["Business Advisor", "Life Coach", "Lernassistent", "Kreativpartner"].map((item) => `<div class="row"><span class="row-title">${item}</span><span class="hint">&gt;</span></div>`).join("")}
      </section>
    </div>
  `;
}

function renderPreferred() {
  return `
    <div class="stack">
      <section class="card">
        <div class="card-header">Darstellung</div>
        <div class="row"><span class="row-title">Erscheinungsbild</span><button class="action-btn">Dunkel</button></div>
        <div class="row"><span class="row-title">Schriftgroesse</span><div class="chip-row"><button class="chip">S</button><button class="chip is-active">M</button><button class="chip">L</button></div></div>
      </section>
      <section class="card">
        <div class="card-header">Verhalten</div>
        <div class="row"><div><div class="row-title">Streaming</div><div class="hint">Antworten live anzeigen</div></div><button class="${toggleClass(state.toggles.live)}" data-toggle="live"></button></div>
        <div class="row"><div><div class="row-title">Token-Zaehler</div><div class="hint">Verbrauch anzeigen</div></div><button class="${toggleClass(state.toggles.tokenCounter)}" data-toggle="tokenCounter"></button></div>
        <div class="row"><div><div class="row-title">Autosave</div><div class="hint">Chats automatisch speichern</div></div><button class="${toggleClass(state.toggles.autosave)}" data-toggle="autosave"></button></div>
      </section>
      <section class="card">
        <div class="card-header">Sicherheit</div>
        <div class="row"><div><div class="row-title">Kids Mode</div><div class="hint">Kindersichere Antworten</div></div><button class="${toggleClass(state.toggles.kidsMode)}" data-toggle="kidsMode"></button></div>
        <div class="row"><div><div class="row-title">Explizite Inhalte erlauben</div><div class="hint">Ermoeglicht uneingeschraenkte Antworten</div></div><button class="${toggleClass(state.toggles.explicit)}" data-toggle="explicit"></button></div>
      </section>
    </div>
  `;
}

function renderGeneral() {
  return `
    <div class="stack">
      <section class="card">
        <div class="card-header">App Info</div>
        <div class="row"><span class="row-title">Version</span><span class="hint">v0.9.1</span></div>
        <div class="row"><span class="row-title">Website</span><span class="green">aura-agent.com</span></div>
        <div class="row"><span class="row-title">Konto</span><span class="hint">Optional - kostenlos testen</span></div>
      </section>
      <section class="card">
        <div class="card-header">Sprache</div>
        <div class="row"><span class="row-title">Sprache</span><span class="hint">Automatisch (Systemsprache)</span></div>
      </section>
      <section class="card">
        <div class="card-header">Nachrichten</div>
        <div class="row"><span class="row-title">Verbrauch (Monat)</span><span class="hint">40 / 1000</span></div>
        <div class="row"><span class="row-title">Aktuelles Tier</span><span class="green">PRO</span></div>
        <div class="row"><span class="row-title">Upgrade auf Max</span><span class="hint">&gt;</span></div>
      </section>
      <section class="card">
        <div class="card-header">Rechtliches</div>
        <div class="row"><span class="row-title">Datenschutzerklaerung</span><span class="hint">&gt;</span></div>
        <div class="row"><span class="row-title">Nutzungsbedingungen (AGB)</span><span class="hint">&gt;</span></div>
        <div class="row"><span class="row-title">Impressum</span><span class="hint">&gt;</span></div>
      </section>
    </div>
  `;
}

function renderDangerzone() {
  return `
    <div class="stack">
      <section class="card">
        <div class="card-header red">Gefahrenzone</div>
        <div class="card-body stack">
          <p class="hint">Kritische Aktionen fuer Konto und Daten. Diese Actions sind nur visuell simuliert.</p>
          <button class="chip red" style="width:max-content">Alle Memories loeschen</button>
          <button class="chip red" style="width:max-content">Alle Chats loeschen</button>
          <button class="chip red" style="width:max-content">Account deaktivieren</button>
        </div>
      </section>
    </div>
  `;
}

function apiRow(name, subtitle) {
  return `
    <div class="row">
      <div>
        <div class="row-title">${name}</div>
        <div class="hint">${subtitle}</div>
      </div>
      <div class="chip-row">
        <button class="chip">Key verwenden</button>
        <button class="${toggleClass(false)}"></button>
      </div>
    </div>
  `;
}

function connectorRow(name, subtitle, toggleKey) {
  return `
    <div class="row">
      <div>
        <div class="row-title">${name}</div>
        <div class="hint">${subtitle}</div>
      </div>
      <button class="${toggleClass(state.toggles[toggleKey])}" data-toggle="${toggleKey}"></button>
    </div>
  `;
}

function openMobileMenu() {
  sidebar.classList.add("open");
  overlay.classList.add("show");
}

function closeMobileMenu() {
  sidebar.classList.remove("open");
  overlay.classList.remove("show");
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
