const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

// Funktion zum Hinzufügen einer Nachricht zum Chat-Fenster
function addMessage(text, sender) {
 const messageElement = document.createElement('div');
 messageElement.classList.add('message', sender === 'user' ? 'user-message' : 'ai-message');
 messageElement.textContent = text;
 chatBox.appendChild(messageElement);
 // Auto-Scroll zum Ende
 chatBox.scrollTop = chatBox.scrollHeight;
}

// Funktion, die die Antwort der KI simuliert
async function getAiResponse(message) {
 // In einer echten Anwendung würdest du hier eine Anfrage an dein Backend senden
 // und die Antwort von der Aura-KI erhalten.
 // Für dieses Beispiel simulieren wir eine einfache Antwort.
 return new Promise(resolve => {
 setTimeout(() => {
 resolve(`Das ist eine simulierte Antwort auf: "${message}"`);
 }, 1000); // Simuliert eine kleine Verzögerung
 });
}

// Event Listener für den Senden-Button
sendButton.addEventListener('click', async () => {
 const messageText = userInput.value.trim();
 if (messageText === '') return;

 addMessage(messageText, 'user');
 userInput.value = ''; // Eingabefeld leeren

 // Hier könnte man einen Ladeindikator anzeigen
 const aiResponse = await getAiResponse(messageText);
 addMessage(aiResponse, 'ai');
});

// Event Listener für Enter-Taste im Eingabefeld
userInput.addEventListener('keypress', (event) => {
 if (event.key === 'Enter') {
 sendButton.click(); // Klickt den Senden-Button, wenn Enter gedrückt wird
 }
});

// Erste Nachricht von der KI (optional)
addMessage("Hallo! Wie kann ich dir heute helfen?", 'ai');