# Installation & Testing Guide

## Local Testing with n8n

### Prerequisites
- n8n installed locally (`npm install -g n8n`)
- Google Cloud project with Chat API enabled
- OAuth2 credentials configured

### Installation Steps

1. **Build the node:**
   ```bash
   npm install
   npm run build
   ```

2. **Link for local development:**
   ```bash
   npm link
   ```

3. **In your n8n custom nodes folder:**
   ```bash
   # Find your n8n folder (usually ~/.n8n)
   cd ~/.n8n
   mkdir -p custom
   cd custom
   npm link n8n-nodes-google-chat-cards-v2
   ```

4. **Start n8n:**
   ```bash
   n8n start
   ```

5. **The node should appear in n8n as "Google Chat Cards v2"**

### Setting Up Google Chat Credentials

1. **Google Cloud Console:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create or select a project
   - Enable "Google Chat API"
   - Go to "APIs & Services" > "Credentials"
   - Create OAuth 2.0 Client ID
   - Set authorized redirect URI: `http://localhost:5678/rest/oauth2-credential/callback`

2. **In n8n:**
   - Go to Credentials
   - Add new "Google Chat OAuth2 API" credential
   - Enter your Client ID and Client Secret
   - Click "Connect My Account"
   - Authorize the application

### Testing the Node

1. **Import the example workflow:**
   - Copy content from `example-workflow.json`
   - In n8n, go to Workflows > Import from File
   - Paste the JSON

2. **Configure the node:**
   - Select your Google Chat space
   - Customize the card content
   - Test with Simple Mode first

3. **Run the workflow:**
   - Click "Execute Workflow"
   - Check Google Chat for the message

### Troubleshooting

**Node doesn't appear in n8n:**
- Ensure the node is built (`npm run build`)
- Check n8n is looking in the right folder
- Restart n8n after linking

**Authentication errors:**
- Ensure Chat API is enabled in Google Cloud
- Check OAuth scopes include `https://www.googleapis.com/auth/chat.messages`
- Re-authenticate the credential in n8n

**Message not sending:**
- Verify the space ID is correct
- Ensure the bot is added to the space
- Check n8n execution logs for detailed errors

### Development Mode

For active development:
```bash
# In the node directory
npm run dev

# This watches for changes and rebuilds automatically
# You'll need to restart n8n to see changes
```

### Publishing to npm

When ready to publish:
```bash
# Update version in package.json
npm version patch  # or minor/major

# Publish to npm
npm publish

# Users can then install with:
# npm install -g n8n-nodes-google-chat-cards-v2
```

## Support

- Report issues: [GitHub Issues](https://github.com/jezweb/n8n-nodes-google-chat-cards-v2/issues)
- n8n Community: [community.n8n.io](https://community.n8n.io)