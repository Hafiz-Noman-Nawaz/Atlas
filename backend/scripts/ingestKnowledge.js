import { connectDB } from '../config/db.js';
import { ragService } from '../services/rag/ragService.js';
import { KnowledgeChunk } from '../models/KnowledgeChunk.js';
import mongoose from 'mongoose';

async function runIngestion() {
  console.log('==================================================');
  console.log('🛡️  Shield Funding Knowledge Base RAG Ingestion');
  console.log('==================================================');

  await connectDB();

  console.log('\n[1/3] Parsing and chunking knowledge documents...');
  const result = await ragService.indexKnowledgeBase(true);

  console.log(`\n[2/3] Indexing complete! Processed ${result.total} chunks.`);

  // Query category distribution from MongoDB
  const categories = await KnowledgeChunk.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  console.log('\n[3/3] KnowledgeChunk Distribution in MongoDB Atlas:');
  categories.forEach((cat) => {
    console.log(`  • ${cat._id.padEnd(20)}: ${cat.count} chunks`);
  });

  const totalInDb = await KnowledgeChunk.countDocuments();
  console.log(`\n✅ Total Knowledge Chunks stored in database: ${totalInDb}`);

  await mongoose.disconnect();
  console.log('Done!');
  process.exit(0);
}

runIngestion().catch((err) => {
  console.error('Ingestion failed:', err);
  process.exit(1);
});
