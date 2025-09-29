#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('Testing Google Chat Cards V2 Node Setup\n');
console.log('========================================\n');

// Check if the node is built
const distPath = path.join(__dirname, 'dist', 'nodes', 'GoogleChatCardsV2');
if (fs.existsSync(distPath)) {
    console.log('✅ Node built successfully');
    console.log(`   Found at: ${distPath}`);

    const files = fs.readdirSync(distPath);
    console.log('   Files:');
    files.forEach(file => console.log(`     - ${file}`));
} else {
    console.log('❌ Node not built. Run: npm run build');
}

// Check if node is linked
const customPath = path.join(process.env.HOME, '.n8n', 'custom', 'node_modules', 'n8n-nodes-google-chat-cards-v2');
if (fs.existsSync(customPath)) {
    console.log('\n✅ Node linked in n8n custom folder');
    console.log(`   Path: ${customPath}`);

    // Check if it's actually linked
    const linkTarget = fs.readlinkSync(customPath);
    console.log(`   Links to: ${linkTarget}`);
} else {
    console.log('\n❌ Node not linked in n8n custom folder');
    console.log('   Run: npm link && cd ~/.n8n/custom && npm link n8n-nodes-google-chat-cards-v2');
}

// Check package.json n8n configuration
const packageJson = require('./package.json');
if (packageJson.n8n && packageJson.n8n.nodes) {
    console.log('\n✅ Package.json configured correctly');
    console.log(`   Node definition: ${packageJson.n8n.nodes[0]}`);
} else {
    console.log('\n❌ Package.json missing n8n configuration');
}

console.log('\n========================================');
console.log('\nTo test in n8n:');
console.log('1. Make sure n8n is running: n8n start');
console.log('2. Open browser to: http://localhost:5678');
console.log('3. Create new workflow');
console.log('4. Search for "Google Chat Cards v2"');
console.log('5. The node should appear in the list');
console.log('\nIf the node doesn\'t appear:');
console.log('- Stop n8n (Ctrl+C)');
console.log('- Rebuild: npm run build');
console.log('- Start n8n: export N8N_CUSTOM_EXTENSIONS="$HOME/.n8n/custom" && n8n start');