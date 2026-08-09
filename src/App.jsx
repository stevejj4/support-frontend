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

      <div
        style={{
          padding: '12px 16px',
          background: '#007bff',
          color: 'white',
          textAlign: 'center',
          flexShrink: 0,
          // Handles top safe area for phones with notches
          paddingTop: 'calc(12px + env(safe-area-inset-top, 0px))',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}
      >

        <h2
          style={{
            margin: 0,
            fontSize: '1.1rem',
            fontWeight: '600'
          }}
        >
          Support Assistant
        </h2>

        <span
          style={{
            fontSize: '0.75rem',
            opacity: 0.85
          }}
        >
          Support Chat
        </span>

      </div>


      {/* =====================================================
          MESSAGE AREA (Optimized Padding & Fluid Scrolling)
      ====================================================== */}

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          // Enables native momentum scrolling on iOS devices
          WebkitOverflowScrolling: 'touch', 
          padding: '16px 12px',
          background: '#f8f9fa',
          display: 'flex',
          flexDirection: 'column'
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
                marginBottom: '10px'
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
                    '10px 14px',

                  // Fluid rounded corners
                  borderRadius:
                    isBot
                      ? '16px 16px 16px 4px'
                      : '16px 16px 4px 16px',

                  // Wider message bubbles on narrow mobile screens
                  maxWidth: '85%',

                  boxShadow:
                    '0 1px 2px rgba(0,0,0,0.05)',

                  fontSize:
                    '0.95rem',

                  lineHeight:
                    '1.4',

                  whiteSpace:
                    'pre-wrap',
                  
                  // Prevents long unbroken URLs or text from blowing out the layout
                  wordBreak: 'break-word' 
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
              paddingLeft: '4px',
              marginTop: '4px'
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

      <form
        onSubmit={handleSendMessage}
        style={{
          padding: '10px 12px',
          borderTop:
            '1px solid #e0e0e0',
          display: 'flex',
          gap: '8px',
          backgroundColor: '#ffffff',
          flexShrink: 0,
          alignItems: 'center',
          // Prevents home indicator overlaps on bezel-less displays (iOS/Android)
          paddingBottom: 'calc(10px + env(safe-area-inset-bottom, 0px))' 
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
          placeholder="Type your question..."
          disabled={isTyping}
          style={{
            flex: 1,
            padding:
              '12px 16px',
            // Pill shape is easier to tap and look native on phones
            borderRadius: '24px', 
            border:
              '1px solid #ced4da',
            // 16px font minimum prevents iOS Safari from forcing an ugly auto-zoom effect on input focus
            fontSize:
              '16px', 
            outline: 'none',
            backgroundColor: '#f8f9fa',
            WebkitAppearance: 'none'
          }}
        />


        <button
          type="submit"
          disabled={
            isTyping ||
            !inputValue.trim()
          }
          style={{
            height: '44px', // Meets minimum standard touch target size heights
            padding:
              '0 20px',
            background:
              isTyping ||
              !inputValue.trim()
                ? '#9ec5fe'
                : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '24px',
            fontWeight: 'bold',
            cursor:
              isTyping ||
              !inputValue.trim()
                ? 'not-allowed'
                : 'pointer',
            fontSize:
              '0.95rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.2s ease'
          }}
        >
          {isTyping
            ? '...'
            : 'Send'}
        </button>

      </form>

    </div>
  </div>
);
}