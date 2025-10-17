import os
import io
import base64
from google.cloud import speech
from google.cloud.speech import RecognitionConfig, RecognitionAudio
import logging

logger = logging.getLogger(__name__)

class SpeechService:
    def __init__(self):
        """Initialize Google Speech API client"""
        try:
            # Set up Google Cloud credentials
            # You'll need to set GOOGLE_APPLICATION_CREDENTIALS environment variable
            # or place your service account key file in the project
            self.client = speech.SpeechClient()
            logger.info("Google Speech API client initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Google Speech API: {e}")
            self.client = None
    
    def transcribe_audio(self, audio_data: bytes, sample_rate: int = 44100, language_code: str = 'en-US') -> str:
        """
        Transcribe audio data to text using Google Speech API
        
        Args:
            audio_data: Raw audio bytes
            sample_rate: Audio sample rate (default: 44100)
            language_code: Language code (default: 'en-US')
        
        Returns:
            Transcribed text or empty string if failed
        """
        if not self.client:
            logger.error("Google Speech API client not initialized")
            return ""
        
        try:
            # Configure recognition settings
            config = RecognitionConfig(
                encoding=RecognitionConfig.AudioEncoding.WEBM_OPUS,
                sample_rate_hertz=sample_rate,
                language_code=language_code,
                enable_automatic_punctuation=True,
                enable_word_time_offsets=True,
                model='latest_long'  # Use the latest model for better accuracy
            )
            
            # Create audio object
            audio = RecognitionAudio(content=audio_data)
            
            # Perform the transcription
            response = self.client.recognize(config=config, audio=audio)
            
            # Extract the transcribed text
            if response.results:
                transcribed_text = ""
                for result in response.results:
                    if result.alternatives:
                        transcribed_text += result.alternatives[0].transcript
                
                logger.info(f"Transcription successful: {transcribed_text}")
                return transcribed_text.strip()
            else:
                logger.warning("No transcription results returned")
                return ""
                
        except Exception as e:
            logger.error(f"Transcription failed: {e}")
            return ""
    
    def transcribe_base64_audio(self, base64_audio: str, sample_rate: int = 44100) -> str:
        """
        Transcribe base64 encoded audio data
        
        Args:
            base64_audio: Base64 encoded audio string
            sample_rate: Audio sample rate
        
        Returns:
            Transcribed text
        """
        try:
            # Decode base64 audio
            audio_data = base64.b64decode(base64_audio)
            return self.transcribe_audio(audio_data, sample_rate)
        except Exception as e:
            logger.error(f"Failed to decode base64 audio: {e}")
            return ""
    
    def is_available(self) -> bool:
        """Check if Google Speech API is available"""
        return self.client is not None

# Global speech service instance
speech_service = SpeechService()
