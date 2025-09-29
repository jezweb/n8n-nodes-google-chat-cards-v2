# Testing the Google Chat Cards v2 Node

## ✅ Test Setup Complete

The node has been successfully set up and is running in your local n8n instance!

### Current Status:
- **n8n is running** at http://localhost:5678
- **Node is built** and available in `dist/` folder
- **Node is linked** to n8n's custom folder
- **All dependencies installed**

## 🚀 How to Test the Node

### 1. Access n8n Interface
Open your browser and go to: **http://localhost:5678**

### 2. Create a New Workflow
- Click "New Workflow" or press Ctrl+N
- This opens a blank workflow canvas

### 3. Add the Google Chat Cards v2 Node
- Click the "+" button to add a node
- Search for "Google Chat Cards"
- You should see "Google Chat Cards v2" in the list
- Click to add it to your workflow

### 4. Configure Google Chat Credentials
First time setup:
1. In the node, click on "Credentials" dropdown
2. Select "Create New"
3. Choose "Google Chat OAuth2 API"
4. Enter your Google Cloud OAuth2 credentials:
   - Client ID
   - Client Secret
5. Click "Connect My Account" to authenticate

### 5. Test Simple Mode
1. Select a Google Chat space from the dropdown
2. Choose "Simple Card" build mode
3. Add a header:
   - Title: "Test Message"
   - Subtitle: "From n8n Node"
4. Add text content: "This is a test message from the new Google Chat Cards v2 node!"
5. Add a button:
   - Text: "Learn More"
   - Action Type: "Open URL"
   - URL: "https://n8n.io"

### 6. Execute the Node
- Add a Manual Trigger node before the Google Chat node
- Connect them
- Click "Execute Workflow"
- Check your Google Chat space for the message!

## 🧪 Test Different Features

### Test 1: Simple Card
```json
{
  "buildMode": "simple",
  "simpleHeader": {
    "title": "Test Card",
    "subtitle": "Testing Simple Mode"
  },
  "simpleText": "This is a basic card test"
}
```

### Test 2: Card with Widgets
- Add an image widget
- Add decorated text with an icon
- Add multiple buttons
- Add a divider

### Test 3: JSON Mode
Switch to JSON mode and paste:
```json
{
  "cardsV2": [{
    "card": {
      "header": {
        "title": "JSON Test",
        "subtitle": "Direct JSON Input"
      },
      "sections": [{
        "widgets": [{
          "textParagraph": {
            "text": "<b>Bold text</b> and <i>italic text</i>"
          }
        }]
      }]
    }
  }]
}
```

## 🔍 Troubleshooting

### Node doesn't appear in n8n:
1. Stop n8n (Ctrl+C in terminal)
2. Rebuild: `npm run build`
3. Restart n8n: `export N8N_CUSTOM_EXTENSIONS="$HOME/.n8n/custom" && n8n start`

### Authentication issues:
- Ensure Google Chat API is enabled in Google Cloud Console
- Check OAuth2 scopes include: `https://www.googleapis.com/auth/chat.messages`
- Re-authenticate the credential

### Message not sending:
- Verify the space ID is correct
- Ensure the bot/app is added to the space
- Check execution logs in n8n for detailed errors

## 📝 Quick Test Commands

```bash
# Check if node is running
curl -s http://localhost:5678/healthz

# Run test script
node test-node.js

# Rebuild and restart
npm run build
pkill n8n
export N8N_CUSTOM_EXTENSIONS="$HOME/.n8n/custom"
n8n start
```

## 🎉 Success Indicators

You know the node is working when:
1. It appears in the n8n node list
2. You can configure credentials
3. Spaces load in the dropdown
4. Messages successfully send to Google Chat
5. Both Simple and JSON modes work

## Next Steps

Once testing is complete:
1. Try more complex card structures
2. Test with different widget combinations
3. Integrate into real workflows
4. Share feedback for improvements

---

**Node is currently running and ready for testing at http://localhost:5678**