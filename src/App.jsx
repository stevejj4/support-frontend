import React, { useState, useEffect } from 'react';

export default function App() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [networkError, setNetworkError] = useState('');

  // Live backend endpoint URL hosted on Render
 // 🌟 FIX: Change this on line 11 to target your explicit server instance URL path
const BACKEND_URL = 'https://support-backend-hbm0.onrender.com';


  // Initialize with a friendly welcome message instead of preloading logs
  useEffect(() => {
    setMessages([
      { 
        id: 'welcome', 
        sender: 'bot', 
        text: 'Hello! I am your Support Assistant. How can I help you with Member Transfers, Next of Kin updates, or Principal information requests today?' 
      }
    ]);
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessageText = inputValue.trim();
    setInputValue('');
    setNetworkError('');

    // Append user message bubble instantly to the UI window
    const userBubble = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userMessageText
    };
    setMessages(prev => [...prev, userBubble]);
    setIsTyping(true);

    try {
      // Fetch response string from your live cloud server
      const response = await fetch(`${BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessageText })
      });
      
      if (!response.ok) {
        throw new Error(`Server returned network error code: ${response.status}`);
      }
      
      const data = await response.json();

      // Append your conversational bot answer bubble
      setMessages(prev => [...prev, {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: data.reply || "I processed that request, but couldn't parse a response text string."
      }]);

    } catch (err) {
      console.error("Network communication error:", err);
      setNetworkError(`⚠️ Connection Failed! Error: ${err.message}`);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', fontFamily: 'system-ui, sans-serif', padding: '0 20px' }}>
      
      {/* Streamlined Conversational Container */}
      <div style={{ border: '1px solid #e0e0e0', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff' }}>
        
        {/* Chat Title bar Header */}
        <div style={{ padding: '20px', background: '#007bff', color: 'white', borderRadius: '11px 11px 0 0', textAlign: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>Knowledge Base Assistant</h2>
          <span style={{ fontSize: '0.8rem', opacity: 0.85 }}>Support Chat</span>
        </div>

        {/* Dynamic Conversation Scrolling pane */}
        <div style={{ height: '450px', overflowY: 'auto', padding: '20px', background: '#f8f9fa' }}>
          {messages.map((msg) => {
            const isBot = msg.sender === 'bot';
            return (
              <div 
                key={msg.id} 
                style={{ 
                  display: 'flex', 
                  justifyContent: isBot ? 'flex-start' : 'flex-end', 
                  marginBottom: '14px' 
                }}
              >
                <div style={{
                  backgroundColor: isBot ? '#ffffff' : '#007bff',
                  color: isBot ? '#212529' : '#ffffff',
                  padding: '12px 16px',
                  borderRadius: isBot ? '16px 16px 16px 4px' : '16px 16px 4px 16px',
                  maxWidth: '75%',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  fontSize: '0.95rem',
                  lineHeight: '1.4',
                  whiteSpace: 'pre-wrap'
                }}>
                  {msg.text}
                </div>
              </div>
            );
          })}
          
          {isTyping && (
            <div style={{ color: '#888', fontSize: '0.85rem', fontStyle: 'italic', paddingLeft: '5px' }}>
              Assistant is looking up knowledge base...
            </div>
          )}

          {networkError && (
            <div style={{ margin: '15px 0', padding: '10px', background: '#f8d7da', color: '#721c24', borderRadius: '6px', fontSize: '0.85rem', textAlign: 'center', fontWeight: 'bold' }}>
              {networkError}
            </div>
          )}
        </div>

        {/* Interactive message form input bar */}
        <form onSubmit={handleSendMessage} style={{ padding: '15px', borderTop: '1px solid #e0e0e0', display: 'flex', gap: '10px', backgroundColor: '#ffffff', borderRadius: '0 0 11px 11px' }}>
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your question here..." 
            style={{ flex: 1, padding: '12px 14px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.95rem', outline: 'none' }}
          />
          <button 
            type="submit" 
            style={{ 
              padding: '12px 24px', 
              background: '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px', 
              fontWeight: 'bold', 
              cursor: 'pointer',
              fontSize: '0.95rem'
            }}
          >
            Send
          </button>
        </form>
      </div>

    </div>
  );
}
