import React, { useState } from 'react';
import { FaMicrophone, FaStop } from 'react-icons/fa';

const BrowserSpeechRecorder = ({ onTranscription }) => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    setError(null);
    setIsListening(true);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      console.log('Speech recognition started');
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log('Transcription:', transcript);
      onTranscription(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const stopListening = () => {
    setIsListening(false);
  };

  return (
    <div style={{ 
      background: '#f8f9fa', 
      padding: '20px', 
      borderRadius: '12px', 
      marginBottom: '20px',
      border: '1px solid #e9ecef',
      textAlign: 'center'
    }}>
      <h3 style={{ 
        marginBottom: '16px', 
        color: '#2d3748',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px'
      }}>
        🎤 Browser Speech Recognition (Free)
      </h3>
      
      <p style={{ 
        color: '#718096', 
        marginBottom: '20px',
        fontSize: '14px'
      }}>
        Uses your browser's built-in speech recognition. No API keys required!
      </p>

      <button
        onClick={isListening ? stopListening : startListening}
        style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          border: 'none',
          background: isListening 
            ? 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          fontSize: '48px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          margin: '20px',
          boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
          animation: isListening ? 'pulse 1.5s infinite' : 'none'
        }}
        onMouseOver={(e) => !isListening && (e.target.style.transform = 'scale(1.05)')}
        onMouseOut={(e) => !isListening && (e.target.style.transform = 'scale(1)')}
      >
        {isListening ? <FaStop /> : <FaMicrophone />}
      </button>

      <div style={{ marginTop: '16px' }}>
        {isListening && (
          <p style={{ color: '#ff6b6b', fontWeight: '600' }}>
            🔴 Listening... Click to stop
          </p>
        )}
        {!isListening && (
          <p style={{ color: '#718096' }}>
            Click the microphone to start recording
          </p>
        )}
      </div>

      {error && (
        <div style={{ 
          background: '#fed7d7', 
          color: '#c53030', 
          padding: '12px', 
          borderRadius: '8px', 
          marginTop: '16px',
          border: '1px solid #fc8181'
        }}>
          {error}
        </div>
      )}

      <div style={{ 
        marginTop: '16px',
        fontSize: '12px',
        color: '#a0aec0'
      }}>
        💡 Works best in Chrome, Edge, or Safari
      </div>
    </div>
  );
};

export default BrowserSpeechRecorder;
