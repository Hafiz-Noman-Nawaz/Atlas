import dotenv from 'dotenv';
dotenv.config();

import { getChatbotResponse } from './src/services/chatbotService.js';

async function runTests() {
  console.log('\n================== EXPANDED MODEL & MEMORY TEST ==================');
  
  // Test 1: User declares name
  const res1 = await getChatbotResponse('My name is Nouman', [], { name: 'Noman' });
  console.log('1. "My name is Nouman":');
  console.log('   Intent:', res1.intent, '| Confidence:', (res1.confidence * 100).toFixed(1) + '%');
  console.log('   Extracted Name:', res1.extractedName);
  console.log('   Response:', res1.response);

  // Test 2: User queries their name
  const res2 = await getChatbotResponse('What is my name?', [], { nickname: 'Nouman', name: 'Noman' });
  console.log('\n2. "What is my name?":');
  console.log('   Intent:', res2.intent, '| Confidence:', (res2.confidence * 100).toFixed(1) + '%');
  console.log('   Response:', res2.response);

  // Test 3: User queries bot identity
  const res3 = await getChatbotResponse('What is your name?', [], {});
  console.log('\n3. "What is your name?":');
  console.log('   Intent:', res3.intent, '| Confidence:', (res3.confidence * 100).toFixed(1) + '%');
  console.log('   Response:', res3.response);

  // Test 4: Code debugging
  const res4 = await getChatbotResponse('Why is my code throwing TypeError: cannot read property of undefined?', [], {});
  console.log('\n4. "Why is my code throwing TypeError...":');
  console.log('   Intent:', res4.intent, '| Confidence:', (res4.confidence * 100).toFixed(1) + '%');
  console.log('   Route:', res4.responseType);

  // Test 5: Database SQL
  const res5 = await getChatbotResponse('Write a SQL query using INNER JOIN between two tables', [], {});
  console.log('\n5. "Write a SQL query using INNER JOIN...":');
  console.log('   Intent:', res5.intent, '| Confidence:', (res5.confidence * 100).toFixed(1) + '%');
  console.log('   Route:', res5.responseType);

  // Test 6: DevOps Git
  const res6 = await getChatbotResponse('How do I undo the last commit in Git?', [], {});
  console.log('\n6. "How do I undo the last commit in Git?":');
  console.log('   Intent:', res6.intent, '| Confidence:', (res6.confidence * 100).toFixed(1) + '%');
  console.log('   Route:', res6.responseType);

  console.log('==================================================================\n');
  process.exit(0);
}

runTests();
