# n8n-nodes-google-chat-cards-v2

This is an n8n community node that lets you create rich, interactive Google Chat messages using the Cards v2 API with a visual builder interface.

## Features

- 🎨 **Visual Card Builder** - Create cards without writing JSON
- 📝 **Simple Mode** - Quick cards with basic elements (header, text, buttons)
- 🔧 **JSON Mode** - Full control with raw JSON input for advanced users
- 🎯 **Rich Widgets Support**:
  - Text with formatting
  - Images with click actions
  - Buttons with custom actions
  - Decorated text with icons
  - Dividers for visual separation
- 🧵 **Thread Support** - Group messages in conversations
- ⚡ **Google Chat OAuth2** - Secure authentication

## Installation

### In n8n

1. Go to **Settings** > **Community Nodes**
2. Search for `n8n-nodes-google-chat-cards-v2`
3. Click **Install**

### Manual Installation

```bash
npm install n8n-nodes-google-chat-cards-v2
```

Then restart your n8n instance.

## Setup

### Google Cloud Console Setup

1. **Enable Google Chat API**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable the Google Chat API

2. **Create OAuth2 Credentials**:
   - Go to APIs & Services > Credentials
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URI: `https://your-n8n-instance.com/rest/oauth2-credential/callback`

3. **Configure OAuth Consent Screen**:
   - Add required scopes: `https://www.googleapis.com/auth/chat.messages`

### n8n Credentials Setup

1. In n8n, go to **Credentials**
2. Create new **Google Chat OAuth2 API** credential
3. Enter your Client ID and Client Secret
4. Authenticate with Google

## Usage

### Simple Mode

Perfect for quick notifications and basic messages:

1. Select **Simple Card** mode
2. Add optional header with title and image
3. Enter your main message text
4. Add buttons for actions
5. Include additional widgets as needed

**Example Simple Card:**
- Header: "Deployment Complete ✅"
- Text: "Your application has been successfully deployed to production."
- Button: "View Application" → Opens URL

### JSON Mode

For advanced users who need full control:

1. Select **JSON Input** mode
2. Enter complete Cards v2 JSON structure
3. Reference [Google Chat Cards API](https://developers.google.com/workspace/chat/api/reference/rest/v1/cards)

**Example JSON:**
```json
{
  "cardsV2": [
    {
      "card": {
        "header": {
          "title": "Custom Card",
          "subtitle": "With full JSON control"
        },
        "sections": [
          {
            "widgets": [
              {
                "textParagraph": {
                  "text": "Your custom content here"
                }
              }
            ]
          }
        ]
      }
    }
  ]
}
```

## Supported Widgets

### Text Paragraph
Basic text content with optional markdown formatting.

### Images
Display images with optional click actions to open URLs.

### Decorated Text
Text with icons, top/bottom labels for rich information display.

### Buttons
Interactive buttons that can:
- Open URLs
- Trigger custom actions with parameters

### Dividers
Visual separators between content sections.

## Examples

### Deployment Notification
```javascript
// Simple Mode Configuration
{
  "buildMode": "simple",
  "simpleHeader": {
    "title": "Deployment Status",
    "subtitle": "Production Environment",
    "imageUrl": "https://example.com/deploy-icon.png",
    "imageType": "CIRCLE"
  },
  "simpleText": "Version 2.1.0 has been successfully deployed",
  "simpleButtons": [
    {
      "text": "View Changes",
      "actionType": "openLink",
      "url": "https://github.com/repo/releases"
    }
  ]
}
```

### Alert Message
```javascript
// Simple Mode with Decorated Text
{
  "buildMode": "simple",
  "simpleText": "System alert triggered",
  "simpleWidgets": {
    "decoratedText": [
      {
        "text": "CPU Usage: 95%",
        "topLabel": "Alert Type",
        "bottomLabel": "Immediate attention required",
        "icon": "CLOCK"
      }
    ]
  }
}
```

## Limitations

- Google Chat supports limited markdown (bold, italic, strikethrough)
- Images must be HTTPS URLs
- Maximum 100 widgets per card
- Some advanced Cards v2 features may require JSON mode

## Roadmap

Future enhancements planned:
- 🎨 Full visual builder with drag-and-drop
- 📚 Template library for common use cases
- 🔄 Card preview before sending
- 📝 Form input widgets support
- 🎯 Advanced action handlers
- 🔧 Webhook response handling

## Resources

- [Google Chat Cards v2 Documentation](https://developers.google.com/workspace/chat/api/reference/rest/v1/cards)
- [n8n Community](https://community.n8n.io)
- [Report Issues](https://github.com/jezweb/n8n-nodes-google-chat-cards-v2/issues)

## License

MIT

## Author

Jeremy Dawes - [Jezweb](https://www.jezweb.com.au)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.