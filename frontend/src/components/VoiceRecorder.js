import React, { useState, useRef } from 'react';
import { FaMicrophone, FaStop, FaPlay } from 'react-icons/fa';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const VoiceRecorder = ({ onExpenseAdded }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [extractedAmount, setExtractedAmount] = useState(null);
  const [extractedCategory, setExtractedCategory] = useState('');
  const [error, setError] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);

  const startRecording = async () => {
    try {
      setError(null);
      setTranscribedText('');
      setExtractedAmount(null);
      setExtractedCategory('');
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        } 
      });
      
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        processRecording();
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      
    } catch (err) {
      setError('Microphone access denied. Please allow microphone access and try again.');
      console.error('Error starting recording:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop all tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  };

  const processRecording = async () => {
    try {
      setIsProcessing(true);
      
      // Create blob from audio chunks
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Audio = reader.result.split(',')[1];
        
        try {
          // Send to backend for transcription
          const response = await axios.post(`${API_BASE_URL}/api/speech/transcribe`, {
            audio_data: base64Audio
          });
          
          const { transcribed_text, amount, category } = response.data;
          
          setTranscribedText(transcribed_text);
          setExtractedAmount(amount);
          setExtractedCategory(category);
          
          // If amount was extracted, automatically add the expense
          if (amount) {
            await addExpense(transcribed_text, amount, category);
          }
          
        } catch (err) {
          setError('Failed to transcribe audio. Please try again.');
          console.error('Transcription error:', err);
        } finally {
          setIsProcessing(false);
        }
      };
      
      reader.readAsDataURL(audioBlob);
      
    } catch (err) {
      setError('Failed to process recording');
      console.error('Processing error:', err);
      setIsProcessing(false);
    }
  };

  const addExpense = async (description, amount, category) => {
    try {
      await onExpenseAdded({
        description,
        amount,
        category
      });
      
      // Reset form
      setTranscribedText('');
      setExtractedAmount(null);
      setExtractedCategory('');
      
    } catch (err) {
      setError('Failed to add expense');
      console.error('Add expense error:', err);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    
    if (!transcribedText.trim()) {
      setError('Please record some audio first');
      return;
    }
    
    if (!extractedAmount) {
      setError('Could not extract amount from your voice. Please try speaking more clearly or add manually.');
      return;
    }
    
    await addExpense(transcribedText, extractedAmount, extractedCategory);
  };

  return (
    <div className="voice-recorder">
      <h2 style={{ marginBottom: '20px', color: '#2d3748' }}>
        🎤 Voice Expense Recording
      </h2>
      
      <div style={{ marginBottom: '30px' }}>
        <button
          className={`voice-button ${isRecording ? 'recording' : ''}`}
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <div className="spinner" style={{ width: '30px', height: '30px', border: '3px solid #f3f3f3', borderTop: '3px solid white' }}></div>
          ) : isRecording ? (
            <FaStop />
          ) : (
            <FaMicrophone />
          )}
        </button>
        
        <div style={{ marginTop: '16px' }}>
          {isRecording && (
            <p style={{ color: '#ff6b6b', fontWeight: '600' }}>
              🔴 Recording... Click to stop
            </p>
          )}
          {isProcessing && (
            <p style={{ color: '#667eea', fontWeight: '600' }}>
              ⚡ Processing your voice...
            </p>
          )}
          {!isRecording && !isProcessing && (
            <p style={{ color: '#718096' }}>
              Click the microphone to start recording your expense
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className="error" style={{ marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {transcribedText && (
        <div style={{ 
          background: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          border: '1px solid #e9ecef'
        }}>
          <h3 style={{ marginBottom: '12px', color: '#2d3748' }}>
            📝 Transcribed Text:
          </h3>
          <p style={{ marginBottom: '16px', fontSize: '16px', lineHeight: '1.5' }}>
            "{transcribedText}"
          </p>
          
          {extractedAmount && (
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ 
                background: '#667eea', 
                color: 'white', 
                padding: '8px 16px', 
                borderRadius: '20px',
                fontWeight: '600'
              }}>
                💰 Amount: ${extractedAmount}
              </div>
              {extractedCategory && (
                <div style={{ 
                  background: '#51cf66', 
                  color: 'white', 
                  padding: '8px 16px', 
                  borderRadius: '20px',
                  fontWeight: '600'
                }}>
                  🏷️ Category: {extractedCategory}
                </div>
              )}
            </div>
          )}
          
          {!extractedAmount && (
            <div style={{ 
              background: '#fff3cd', 
              color: '#856404', 
              padding: '12px', 
              borderRadius: '6px',
              marginTop: '12px'
            }}>
              ⚠️ Could not extract amount. Please try speaking more clearly or add manually.
            </div>
          )}
        </div>
      )}

      {transcribedText && extractedAmount && (
        <button
          className="btn btn-success"
          onClick={handleManualSubmit}
          style={{ marginTop: '16px' }}
        >
          <FaPlay /> Add This Expense
        </button>
      )}
    </div>
  );
};

export default VoiceRecorder;
