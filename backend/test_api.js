import http from 'http';
import app from './app.js';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

async function runTests() {
  console.log('--- Starting Backend Verification Tests ---');

  let mongod = null;
  try {
    console.log('[1/10] Initializing test database...');
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    console.log(`[MongoDB] Connected to in-memory test database: ${uri}`);
  } catch (dbErr) {
    console.warn('[MongoDB] MongoMemoryServer init warning:', dbErr.message);
  }

  // Start test server on port 5099
  const PORT = 5099;
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(PORT, resolve));
  console.log(`[Test Server] Listening on http://localhost:${PORT}`);

  const baseUrl = `http://localhost:${PORT}/api`;
  let authToken = null;
  let testUserId = null;
  let conversationId = null;

  try {
    // Test 1: Health Check
    console.log('\n[1] Testing GET /api/health ...');
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthData = await healthRes.json();
    console.log('Health Response:', healthData);
    if (!healthData.success) throw new Error('Health check failed');

    // Test 2: User Registration
    const testEmail = `intern_${Date.now()}@shieldfunding.com`;
    console.log(`\n[2] Testing POST /api/auth/register with ${testEmail} ...`);
    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Shield Intern',
        email: testEmail,
        password: 'password123',
      }),
    });
    const regData = await regRes.json();
    console.log('Register Response Status:', regRes.status, regData.message);
    if (!regData.success || !regData.data.token) {
      throw new Error(`Registration failed: ${JSON.stringify(regData)}`);
    }
    authToken = regData.data.token;
    testUserId = regData.data.user.id;

    // Test 3: User Login
    console.log('\n[3] Testing POST /api/auth/login ...');
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'password123',
      }),
    });
    const loginData = await loginRes.json();
    console.log('Login Response Status:', loginRes.status, loginData.message);
    if (!loginData.success || !loginData.data.token) {
      throw new Error('Login failed');
    }

    // Test 4: Auth Me (Protected Route)
    console.log('\n[4] Testing GET /api/auth/me ...');
    const meRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const meData = await meRes.json();
    console.log('Me Response Email:', meData.data.user.email);
    if (!meData.success || meData.data.user.id !== testUserId) {
      throw new Error('Auth me check failed');
    }

    // Test 5: Create Conversation
    console.log('\n[5] Testing POST /api/conversations ...');
    const createConvRes = await fetch(`${baseUrl}/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        title: 'Merchant Cash Advance Inquiry',
      }),
    });
    const createConvData = await createConvRes.json();
    console.log('Created Conversation ID:', createConvData.data._id);
    if (!createConvData.success || !createConvData.data._id) {
      throw new Error('Create conversation failed');
    }
    conversationId = createConvData.data._id;

    // Test 6: List Conversations
    console.log('\n[6] Testing GET /api/conversations ...');
    const listConvRes = await fetch(`${baseUrl}/conversations`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const listConvData = await listConvRes.json();
    console.log(`Found ${listConvData.data.length} conversation(s)`);
    if (!listConvData.success || listConvData.data.length === 0) {
      throw new Error('List conversations failed');
    }

    // Test 7: Post Message & Trigger Mock AI Response
    console.log('\n[7] Testing POST /api/conversations/:id/messages ...');
    const msgRes = await fetch(`${baseUrl}/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        content: 'What funding options does Shield Funding offer for small businesses?',
      }),
    });
    const msgData = await msgRes.json();
    console.log('User Message:', msgData.data.userMessage.content);
    console.log('Assistant AI Response Preview:', msgData.data.assistantMessage.content.slice(0, 70) + '...');
    if (!msgData.success || !msgData.data.assistantMessage) {
      throw new Error('Message creation/AI response failed');
    }

    // Test 8: Get Conversation Messages
    console.log('\n[8] Testing GET /api/conversations/:id/messages ...');
    const getMsgsRes = await fetch(`${baseUrl}/conversations/${conversationId}/messages`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const getMsgsData = await getMsgsRes.json();
    console.log(`Retrieved ${getMsgsData.data.length} message(s) in conversation`);
    if (!getMsgsData.success || getMsgsData.data.length !== 2) {
      throw new Error(`Expected 2 messages, got ${getMsgsData.data.length}`);
    }

    // Test 9: Knowledge Base Overview
    console.log('\n[9] Testing GET /api/knowledge/overview ...');
    const kbRes = await fetch(`${baseUrl}/knowledge/overview`);
    const kbData = await kbRes.json();
    console.log('Knowledge Base Stats:', {
      faqs: kbData.data.faqsCount,
      products: kbData.data.productsCount,
      rebuttals: kbData.data.rebuttalsCount,
      declineReasons: kbData.data.declineReasonsCount,
    });
    if (!kbData.success || kbData.data.faqsCount === 0) {
      throw new Error('Knowledge Base loading failed');
    }

    // Test 10: Delete Conversation
    console.log('\n[10] Testing DELETE /api/conversations/:id ...');
    const delRes = await fetch(`${baseUrl}/conversations/${conversationId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const delData = await delRes.json();
    console.log('Delete Conversation Status:', delData.message);
    if (!delData.success) {
      throw new Error('Delete conversation failed');
    }

    console.log('\n======================================================');
    console.log('🎉 ALL 10 BACKEND & KNOWLEDGE BASE TESTS PASSED 100%!');
    console.log('======================================================');
  } catch (err) {
    console.error('\n❌ Test failed with error:', err);
    process.exitCode = 1;
  } finally {
    server.close();
    await mongoose.disconnect();
    if (mongod) await mongod.stop();
    console.log('[Test Server] Closed & cleaned up.');
  }
}

runTests();
