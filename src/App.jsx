import React, { useState, useEffect, useRef } from 'react';
import './ChatWidget.css';

export default function App() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [networkError, setNetworkError] = useState('');
  const [hasUserSent, setHasUserSent] = useState(false);
  const scrollRef = useRef(null);

  // ============================================================
  // BACKEND CONFIGURATION
  // ============================================================

  const rawBackendUrl = import.meta.env.VITE_BACKEND_URL?.trim();

  const BACKEND_URL = rawBackendUrl
    ? rawBackendUrl.replace(/\/+$/, '')
    : '';

  // ============================================================
  // STARTUP
  // ============================================================

  useEffect(() => {
    setMessages([
      {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text:
          'Hello! I am your Support Assistant. How can I help you with Member Transfers, Next of Kin updates, or Principal information requests today?',
        time: new Date().toISOString()
      }
    ]);
  }, []);

  // Auto-scroll when messages or typing change
  useEffect(() => {
    try {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    } catch (e) {
      // ignore
    }
  }, [messages, isTyping]);

  // ============================================================
  // SEND MESSAGE
  // ============================================================

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputValue.trim() || isTyping) {
      return;
    }

    const userMessageText = inputValue.trim();

    setInputValue('');
    setNetworkError('');

    // ----------------------------------------------------------
    // Add user message immediately
    // ----------------------------------------------------------

    const userBubble = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userMessageText,
      time: new Date().toISOString()
    };

    setMessages((prev) => [
      ...prev,
      userBubble
    ]);

    setHasUserSent(true);
    setIsTyping(true);

    try {

      // --------------------------------------------------------
      // Validate backend configuration
      // --------------------------------------------------------

      if (!BACKEND_URL) {

        throw new Error(
          'VITE_BACKEND_URL is not configured. Please configure the Render backend URL in Vercel.'
        );
      }

      // --------------------------------------------------------
      // Build endpoint
      // --------------------------------------------------------

      const endpoint =
        `${BACKEND_URL}/api/chat`;

      console.log(
        '📡 Sending request to:',
        endpoint
      );

      // --------------------------------------------------------
      // Send request
      // --------------------------------------------------------

      const response =
        await fetch(
          endpoint,
          {
            method: 'POST',

            headers: {
              'Content-Type': 'application/json'
            },

            body: JSON.stringify({
              message:
                userMessageText
            })
          }
        );

      // --------------------------------------------------------
      // Read response body first
      // --------------------------------------------------------

      let data = {};

      try {

        data =
          await response.json();

      } catch (jsonError) {

        console.error(
          '❌ Could not parse backend response:',
          jsonError
        );
      }

      // --------------------------------------------------------
      // Handle HTTP errors
      // --------------------------------------------------------

      if (!response.ok) {

        console.error(
          '❌ Backend returned HTTP error:',
          response.status,
          data
        );

        throw new Error(
          data.reply ||
          data.error ||
          `Server returned HTTP ${response.status}`
        );
      }

      // --------------------------------------------------------
      // Validate reply
      // --------------------------------------------------------

      const botReply =
        data.reply ||
        "I processed that request, but couldn't parse a response text string.";

      // --------------------------------------------------------
      // Add assistant message
      // --------------------------------------------------------

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: botReply,
          time: new Date().toISOString()
        }
      ]);

    } catch (err) {

      console.error(
        '❌ Network communication error:',
        err
      );

      setNetworkError(
        `⚠️ Connection Failed: ${err.message}`
      );

    } finally {

      setIsTyping(false);
    }
  };

  // ============================================================
  // UI
  // ============================================================

  return (
  <div
    style={{
      width: '100vw',
      // Uses dynamic viewport height to prevent mobile browser bars from cutting off the bottom input
      height: '100dvh', 
      fontFamily: 'system-ui, -apple-system, sans-serif',
      boxSizing: 'border-box',
      margin: 0,
      padding: 0,
      backgroundColor: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}
  >

    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#ffffff'
      }}
    >

      {/* =====================================================
          HEADER (Compacted for Mobile)
      ====================================================== */}

      <header className="chat-header">
        <div className="header-left">
          <svg className="chat-icon" viewBox="0 0 24 24" aria-hidden>
            <path fill="currentColor" d="M4 4h16v10H7l-3 3V4z" />
          </svg>
          <div>
            <div className="chat-title">Support Assistant</div>
            <div className="chat-sub">Support Chat</div>
          </div>
        </div>

        <div className="header-right">
          <div className="status-dot" title="Online" />
          <button className="menu-btn" aria-label="Menu">⋮</button>
        </div>
      </header>


      {/* =====================================================
          MESSAGE AREA (Optimized Padding & Fluid Scrolling)
      ====================================================== */}

      <div className="chat-body" ref={scrollRef}>

        <div className="topic-chips" aria-hidden={hasUserSent}>
          {['Member Transfers', 'Principals', 'Next of Kin'].map((t) => (
            <button
              key={t}
              className="chip"
              onClick={() => setInputValue(t)}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="messages">
          {messages.map((msg) => {
            const isBot = msg.sender === 'bot';
            return (
              <div
                key={msg.id}
                className={['message-row', isBot ? 'bot' : 'user'].join(' ')}
              >
                {isBot && (
                  <div className="avatar" aria-hidden>
                    <svg viewBox="0 0 24 24" className="avatar-svg"><circle cx="12" cy="8" r="3"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></svg>
                  </div>
                )}

                <div className="bubble">
                  <div className="bubble-text">{msg.text}</div>
                  <div className="bubble-meta">
                    <time className="time">{new Date(msg.time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</time>
                  </div>
                </div>
              </div>
            );
          })}
        </div>


        {/* ===================================================
            TYPING INDICATOR
        ==================================================== */}

        {isTyping && (
          <div className="message-row bot typing-row">
            <div className="avatar" aria-hidden>
              <svg viewBox="0 0 24 24" className="avatar-svg"><circle cx="12" cy="8" r="3"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></svg>
            </div>
            <div className="bubble">
              <div className="typing">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          </div>
        )}


        {/* ===================================================
            ERROR
        ==================================================== */}

        {networkError && (
          <div
            style={{
              margin: '10px 0',
              padding: '10px',
              background: '#f8d7da',
              color: '#721c24',
              borderRadius: '8px',
              fontSize: '0.85rem',
              textAlign: 'center',
              fontWeight: 'bold'
            }}
          >
            {networkError}
          </div>
        )}

      </div>


      {/* =====================================================
          INPUT FORM (Touch & Mobile Keyboard Optimized)
      ====================================================== */}

      <form className="chat-input" onSubmit={handleSendMessage}>
        <div className="input-pill">
          <input
            className="input-field"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your question..."
            disabled={isTyping}
          />
          <button
            type="submit"
            className={"send-btn " + (isTyping || !inputValue.trim() ? 'disabled' : '')}
            disabled={isTyping || !inputValue.trim()}
          >
            {isTyping ? '...' : 'Send'}
          </button>
        </div>

        {!hasUserSent && (
          <div className="suggestions" aria-hidden={hasUserSent}>
            {['How to transfer a member', 'Update next of kin', 'Request principal info'].map((s) => (
              <button
                key={s}
                type="button"
                className="suggestion-pill"
                onClick={() => setInputValue(s)}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div className="footer-attr">Powered by Support Assistant • © Your Org</div>
      </form>

    </div>
  </div>
);
}