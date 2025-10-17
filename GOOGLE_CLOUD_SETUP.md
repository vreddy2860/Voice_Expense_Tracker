# 🔧 Google Cloud Speech API Setup

## Why This is Needed

The Voice Expense Tracker uses Google Speech API to convert your voice recordings into text. Without this setup, voice recording will work but won't transcribe the audio.

## 🚀 Quick Setup Steps

### 1. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name it: `voice-expense-tracker`
4. Click "Create"

### 2. Enable Speech-to-Text API
1. In the Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for "Speech-to-Text API"
3. Click on it and click "Enable"

### 3. Create Service Account
1. Go to "IAM & Admin" → "Service Accounts"
2. Click "Create Service Account"
3. Name: `voice-expense-tracker-service`
4. Description: `Service account for Voice Expense Tracker`
5. Click "Create and Continue"
6. Grant role: "Speech-to-Text User"
7. Click "Continue" → "Done"

### 4. Create and Download Key
1. Click on your service account
2. Go to "Keys" tab
3. Click "Add Key" → "Create new key"
4. Choose "JSON" format
5. Click "Create"
6. Save the downloaded file as `service-account-key.json`

### 5. Set Environment Variable
```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/service-account-key.json"
```

### 6. Restart Backend
```bash
cd backend
source venv/bin/activate
python3 app.py
```

## 🎯 Alternative: Manual Expense Entry

If you don't want to set up Google Cloud right now, you can still use the app by:

1. **Clicking the microphone** to record (it will show a message about setup)
2. **Adding expenses manually** by typing them in
3. **Using the expense management features** without voice transcription

## 💡 Benefits of Google Cloud Setup

- **92% Recognition Accuracy**: Industry-leading speech recognition
- **Real-time Transcription**: Instant voice-to-text conversion
- **Automatic Categorization**: AI-powered expense categorization
- **Natural Language Processing**: Understands complex expense descriptions

## 🔒 Security Note

- Keep your service account key file secure
- Don't commit it to version control
- Consider using environment variables in production

## 🆘 Troubleshooting

### "Speech service not available" error
- Check that `GOOGLE_APPLICATION_CREDENTIALS` is set correctly
- Verify the JSON key file path is correct
- Ensure the Speech-to-Text API is enabled

### "Permission denied" error
- Check that the service account has "Speech-to-Text User" role
- Verify the API is enabled in your project

### Still having issues?
- Check the backend logs for detailed error messages
- Verify your Google Cloud project has billing enabled
- Ensure the Speech-to-Text API is properly enabled

## 🎉 Once Setup is Complete

Your Voice Expense Tracker will have:
- ✅ **Voice Recording**: Click microphone, speak your expense
- ✅ **AI Transcription**: Convert speech to text automatically
- ✅ **Smart Categorization**: Automatically categorize expenses
- ✅ **Real-time Processing**: Instant expense logging

Happy expense tracking! 🎤💰
