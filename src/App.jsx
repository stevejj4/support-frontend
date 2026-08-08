import React, { useState, useEffect } from 'react';

export default function App() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [networkError, setNetworkError] = useState('');
  
  // Performance Analytics Dashboard States
  const [avgLatency, setAvgLatency] = useState(0);
  const [totalQueries, setTotalQueries] = useState(0);

  // Live backend endpoint URL hosted on Render
  const BACKEND_URL = 'https://support-backend-hbm0.onrender.com';

  // Fetch initial baseline conversation history on load
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/conversations`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP Error Status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data && data.length > 0) {
          setMessages(data);
        } else {
          // Fallback welcome message if the database returns empty logs
          setMessages([
            { id: 'welcome', sender: 'bot', text: 'Hello! I am your AI Support Assistant. Ask me any question and watch performance metrics update in real-time below.' }
          ]);
        }
      })
      .catch((err) => {
        console.error("Error fetching baseline history:", err);
        setNetworkError(`Could not preload logs from server: ${err.message}`);
        // Ensure user is greeted even if pre-fetch fails
        setMessages([
          { id: 'welcome', sender: 'bot', text: 'Hello! Live history sync unavailable, but the real-time AI engine is ready. Ask me a question!' }
        ]);
      });
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessageText = inputValue.trim();
    setInputValue('');
    setNetworkError('');

    // 1. Append user bubble instantly to the UI window
    const userBubble = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userMessageText
    };
    setMessages(prev => [...prev, userBubble]);
    setIsTyping(true);

    // Track response round-trip speed
    const clientStartTime = Date.now();

    try {
      // 2. Fetch match from your production Render backend endpoint
      const response = await fetch(`${BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessageText })
      });
      
      if (!response.ok) {
        throw new Error(`Server returned network error code: ${response.status}`);
      }
      
      const data = await response.json();
      const clientEndTime = Date.now();
      const roundTripTimeSec = ((clientEndTime - clientStartTime) / 1000);

      // 3. Append matching bot response from Gemini to the screen
      setMessages(prev => [...prev, {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: data.reply || "I received a message, but no text answer was returned."
      }]);

      // 📊 Live Performance Dashboard Calculations
      setTotalQueries(prev => {
        const nextTotal = prev + 1;
        setAvgLatency(currentAvg => {
          if (currentAvg === 0) return parseFloat(roundTripTimeSec.toFixed(2));
          const updatedAvg = ((currentAvg * prev) + roundTripTimeSec) / nextTotal;
          return parseFloat(updatedAvg.toFixed(2));
        });
        return nextTotal;
      });

    } catch (err) {
      console.error("Network communication error:", err);
      setNetworkError(`⚠️ Connection Failed! Error: ${err.message}`);
      
      // Append explicit warning block straight into chat timeline
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        sender: 'bot',
        text: `⚠️ Lost connection to our backend server. Please verify your Render API instance is active.`
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div style={{ maxWidth: '950px', margin: '40px auto', display: 'flex', gap: '25px', fontFamily: 'system-ui, sans-serif', padding: '0 20px' }}>
      
      {/* LEFT COMPONENT: The Live Chat Interface Container */}
      <div style={{ flex: 2, border: '1px solid #e0e0e0', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff' }}>
        
        {/* Chat Title bar Header */}
        <div style={{ padding: '20px', background: '#007bff', color: 'white', borderRadius: '11px 11px 0 0', textAlign: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>Knowledge Base Assistant</h2>
          <span style={{ fontSize: '0.8rem', opacity: 0.85 }}>Production Mode Connected</span>
        </div>

        {/* Dynamic Conversation Scrolling pane */}
        <div style={{ height: '420px', overflowY: 'auto', padding: '20px', background: '#f8f9fa' }}>
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
            <div style={{ color: '#007bff', fontSize: '0.85rem', fontStyle: 'italic', paddingLeft: '5px', animation: 'pulse 1.5s infinite' }}>
              Assistant is analyzing knowledge base context...
            </div>
          )}

          {networkError && (
            <div style={{ margin: '15px 0', padding: '10px', background: '#f8d7da', color: '#721c24', borderRadius: '6px', fontSize: '0.85rem', textAlign: 'center', fontWeight: 'bold' }}>
              {networkError}
            </div>
          )}
        </div>

        {/* Interactive message form bar input */}
        <form onSubmit={handleSendMessage} style={{ padding: '15px', borderTop: '1px solid #e0e0e0', display: 'flex', gap: '10px', backgroundColor: '#ffffff', borderRadius: '0 0 11px 11px' }}>
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a support question here..." 
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
              fontSize: '0.95rem',
              transition: 'background 0.2s'
            }}
          >
            Send
          </button>
        </form>
      </div>

      {/* RIGHT COMPONENT: Real-time Operational Analytics Dashboard Panel */}
      <div style={{ flex: 1, border: '1px solid #e0e0e0', borderRadius: '12px', padding: '24px', backgroundColor: '#ffffff', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', height: 'fit-content' }}>
        <h3 style={{ marginTop: 0, color: '#333', borderBottom: '2px solid #f0f0f0', paddingBottom: '12px', fontSize: '1.1rem', fontWeight: '700' }}>
          ⚡ App Performance
        </h3>
        
        <div style={{ marginBottom: '24px', marginTop: '15px' }}>
          <label style={{ fontSize: '0.75rem', color: '#6c757d', fontWeight: '800', letterSpacing: '0.5px' }}>
            SESSION TRAFFIC COUNT
          </label>
          <div style={{ fontSize: '2.2rem', fontWeight: '700', color: '#007bff', marginTop: '4px' }}>
            {totalQueries} <span style={{ fontSize: '1rem', color: '#6c757d', fontWeight: 'normal' }}>queries</span>
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ fontSize: '0.75rem', color: '#6c757d', fontWeight: '800', letterSpacing: '0.5px' }}>
            AVG ROUND-TRIP LATENCY
          </label>
          <div style={{ fontSize: '2.2rem', fontWeight: '700', color: avgLatency > 4 ? '#dc3545' : '#28a745', marginTop: '4px' }}>
            {avgLatency === 0 ? "0.00" : `${avgLatency}`}<span style={{ fontSize: '1.2rem' }}>s</span>
          </div>
        </div>

        <div style={{ padding: '14px', backgroundColor: '#f8f9fa', borderRadius: '8px', fontSize: '0.85rem', color: '#495057', lineHeight: '1.5', borderLeft: '4px solid #007bff' }}>
          <strong>Architecture Metrics Info:</strong> Client round-trip timing factors in network transmission latency + Render API response compile time.
        </div>
      </div>

    </div>
  );
}
