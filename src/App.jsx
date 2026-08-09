import React, { useState, useEffect } from 'react';

export default function App() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [networkError, setNetworkError] = useState('');

  // ============================================================
  // BACKEND CONFIGURATION
  // ============================================================

  const rawBackendUrl =
    import.meta.env.VITE_BACKEND_URL?.trim();

  const BACKEND_URL = rawBackendUrl
    ? rawBackendUrl.replace(/\/+$/, '')
    : '';

  // ============================================================
  // STARTUP
  // ============================================================

  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        sender: 'bot',
        text:
          'Hello! I am your Support Assistant. How can I help you with Member Transfers, Next of Kin updates, or Principal information requests today?'
      }
    ]);
  }, []);

  // ============================================================
  // SEND MESSAGE
  // ============================================================

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputValue.trim() || isTyping) {
      return;
    }

    const userMessageText =
      inputValue.trim();

    setInputValue('');
    setNetworkError('');

    // ----------------------------------------------------------
    // Add user message immediately
    // ----------------------------------------------------------

    const userBubble = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userMessageText
    };

    setMessages((prev) => [
      ...prev,
      userBubble
    ]);

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
          text: botReply
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
      height: '100vh',
      fontFamily: 'system-ui, sans-serif',
      boxSizing: 'border-box',
      margin: 0,
      padding: 0,
      backgroundColor: '#f5f5f5',
      display: 'flex',
      flexDirection: 'column'
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
          HEADER
      ====================================================== */}

      <div
        style={{
          padding: '20px',
          background: '#007bff',
          color: 'white',
          textAlign: 'center',
          flexShrink: 0
        }}
      >

        <h2
          style={{
            margin: 0,
            fontSize: '1.25rem',
            fontWeight: '600'
          }}
        >
          Support Assistant
        </h2>

        <span
          style={{
            fontSize: '0.8rem',
            opacity: 0.85
          }}
        >
          Support Chat
        </span>

      </div>


      {/* =====================================================
          MESSAGE AREA (Fills available space)
      ====================================================== */}

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          background: '#f8f9fa'
        }}
      >

        {messages.map((msg) => {

          const isBot =
            msg.sender === 'bot';

          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                justifyContent:
                  isBot
                    ? 'flex-start'
                    : 'flex-end',
                marginBottom: '14px'
              }}
            >

              <div
                style={{
                  backgroundColor:
                    isBot
                      ? '#ffffff'
                      : '#007bff',

                  color:
                    isBot
                      ? '#212529'
                      : '#ffffff',

                  padding:
                    '12px 16px',

                  borderRadius:
                    isBot
                      ? '16px 16px 16px 4px'
                      : '16px 16px 4px 16px',

                  maxWidth: '75%',

                  boxShadow:
                    '0 1px 3px rgba(0,0,0,0.05)',

                  fontSize:
                    '0.95rem',

                  lineHeight:
                    '1.4',

                  whiteSpace:
                    'pre-wrap'
                }}
              >
                {msg.text}
              </div>

            </div>
          );
        })}


        {/* ===================================================
            TYPING INDICATOR
        ==================================================== */}

        {isTyping && (
          <div
            style={{
              color: '#888',
              fontSize: '0.85rem',
              fontStyle: 'italic',
              paddingLeft: '5px'
            }}
          >
            Assistant at work...
          </div>
        )}


        {/* ===================================================
            ERROR
        ==================================================== */}

        {networkError && (
          <div
            style={{
              margin: '15px 0',
              padding: '10px',
              background: '#f8d7da',
              color: '#721c24',
              borderRadius: '6px',
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
          INPUT FORM
      ====================================================== */}

      <form
        onSubmit={handleSendMessage}
        style={{
          padding: '15px',
          borderTop:
            '1px solid #e0e0e0',
          display: 'flex',
          gap: '10px',
          backgroundColor: '#ffffff',
          flexShrink: 0
        }}
      >

        <input
          type="text"
          value={inputValue}
          onChange={(e) =>
            setInputValue(
              e.target.value
            )
          }
          placeholder="Type your question here..."
          disabled={isTyping}
          style={{
            flex: 1,
            padding:
              '12px 14px',
            borderRadius: '6px',
            border:
              '1px solid #ccc',
            fontSize:
              '0.95rem',
            outline: 'none'
          }}
        />


        <button
          type="submit"
          disabled={
            isTyping ||
            !inputValue.trim()
          }
          style={{
            padding:
              '12px 24px',
            background:
              isTyping ||
              !inputValue.trim()
                ? '#9ec5fe'
                : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor:
              isTyping ||
              !inputValue.trim()
                ? 'not-allowed'
                : 'pointer',
            fontSize:
              '0.95rem'
          }}
        >
          {isTyping
            ? 'Sending...'
            : 'Send'}
        </button>

      </form>

    </div>
  </div>
);
}