import React, { useState } from 'react';

export default function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hello! I am your Avani Library AI Assistant. Ask me anything or use Voice/Mic!' }
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    const updatedMessages = messages.concat({ sender: 'user', text: userMsg });
    setMessages(updatedMessages);
    setInput('');

    setTimeout(() => {
      let reply = "I'm here to help with your library queries!";
      const lower = userMsg.toLowerCase();

      if (lower.indexOf('seat') !== -1) {
        reply = "You can book any available green seat from the 70-seat layout!";
      } else if (lower.indexOf('fee') !== -1) {
        reply = "Monthly fees are ₹500. Pay online or at the admin desk to get your instant receipt and thank-you confirmation.";
      } else if (lower.indexOf('timing') !== -1) {
        reply = "Avani Library 3D is open 24/7 for all active students.";
      } else if (lower.indexOf('wifi') !== -1) {
        reply = "Wi-Fi Network: Avani_Fiber_5G | Password: library2026";
      }

      setMessages(updatedMessages.concat({ sender: 'ai', text: reply }));
    }, 500);
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech Recognition is not supported in this browser. Please use Chrome!');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      setInput(speechToText);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen ? (
        <button onClick={() => setIsOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-2xl font-bold transition flex items-center gap-2">
          🤖 AI Assistant & Mic
        </button>
      ) : (
        <div className="bg-gray-800 border border-indigo-500/50 w-80 sm:w-96 rounded-2xl shadow-2xl flex flex-col h-[420px] overflow-hidden text-white">
          <div className="bg-indigo-900 p-3 flex justify-between items-center border-b border-indigo-700">
            <h3 className="font-bold text-sm">Avani AI Voice Support</h3>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white font-bold px-2">&times;</button>
          </div>
          <div className="flex-1 p-3 overflow-y-auto space-y-2 text-sm bg-gray-900/40">
            {messages.map((m, idx) => {
              const isUser = m.sender === 'user';
              return (
                <div key={idx} className={isUser ? "flex justify-end" : "flex justify-start"}>
                  <div className={isUser ? "p-2 rounded bg-indigo-600 text-white max-w-[80%]" : "p-2 rounded bg-gray-700 text-gray-200 max-w-[80%]"}>
                    {m.text}
                  </div>
                </div>
              );
            })}
          </div>
          <form onSubmit={handleSend} className="p-2 bg-gray-800 border-t border-gray-700 flex gap-2 items-center">
            <button type="button" onClick={handleVoiceInput} className={isListening ? "p-2 rounded font-bold text-xs bg-red-600 animate-pulse" : "p-2 rounded font-bold text-xs bg-gray-700 hover:bg-gray-600"} title="Click to Speak">
              🎤
            </button>
            <input 
              type="text" 
              placeholder={isListening ? "Listening..." : "Ask or speak..."} 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white focus:outline-none"
            />
            <button type="submit" className="bg-indigo-600 px-3 py-1 rounded text-sm font-bold text-white">Send</button>
          </form>
        </div>
      )}
    </div>
  );
}
