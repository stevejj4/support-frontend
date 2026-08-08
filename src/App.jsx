import React, { useState, useEffect } from 'react';

export default function App() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Initialize with a friendly welcome message
  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        sender: 'bot',
        text: 'Hello! I am your Knowledge Base Assistant. Ask me anything about Member Transfers, Principal updates, or next of kin policies.'
      }
    ]);
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessageText = inputValue.trim();
    setInputValue('');

    // 1. Append user bubble instantly to UI
    const userBubble = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userMessageText
    };
    setMessages(prev => [...prev, userBubble]);
    setIsTyping(true);

    try {
      // 2. Fetch match from your backend endpoint
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessageText })
      });
      const data = await response.json();

      // 3. Append matching Firestore bot response
      setMessages(prev => [...prev, {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: data.reply
      }]);
    } catch (err) {
      console.error("Network communication error:", err);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div style={{ 
      maxWidth: '600px', 
      margin: '40px auto', 
      border: '1px solid #e0e0e0', 
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      fontFamily: 'system-ui, sans-serif'
    }}>
      {/* Header */}
      <div style={{ padding: '20px', background: '#007bff', color: 'white', borderRadius: '12px 12px 0 0', textAlign: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Knowledge Base Support</h2>
      </div>

      {/* Main Screen Panel */}
      <div style={{ height: '450px', overflowY: 'auto', padding: '20px', background: '#f8f9fa' }}>
        {messages.map((msg) => {
          const isBot = msg.sender === 'bot';
          return (
            <div key={msg.id} style={{ display: 'flex', justifyContent: isBot ? 'flex-start' : 'flex-end', marginBottom: '14px' }}>
              <div style={{
                backgroundColor: isBot ? '#ffffff' : '#007bff',
                color: isBot ? '#212529' : '#ffffff',
                padding: '10px 16px',
                borderRadius: isBot ? '16px 16px 16px 4px' : '16px 16px 4px 16px',
                maxWidth: '75%',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                fontSize: '0.95rem',
                lineHeight: '1.4'
              }}>
                {msg.text}
              </div>
            </div>
          );
        })}
        {isTyping && (
          <div style={{ color: '#888', fontSize: '0.85rem', fontStyle: 'italic', paddingLeft: '5px' }}>
            Assistant is searching knowledge base...
          </div>
        )}
      </div>

      {/* Message Submission Area */}
      <form onSubmit={handleSendMessage} style={{ padding: '15px', borderTop: '1px solid #e0e0e0', display: 'flex', gap: '10px' }}>
        <input 
          type="text" 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask a question (e.g., 'What details are required for a transfer?')..." 
          style={{ flex: 1, padding: '10px 14px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.95rem' }}
        />
        <button type="submit" style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
          Send
        </button>
      </form>
    </div>
  );
}
