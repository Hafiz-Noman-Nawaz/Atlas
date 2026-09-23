import { KnowledgeChunk } from '../../models/KnowledgeChunk.js';
import { generateKnowledgeChunks } from './chunker.js';
import { generateEmbedding, generateLocalFallbackEmbedding, cosineSimilarity } from './embeddingService.js';
import { isDbConnected } from '../../config/db.js';

class RAGService {
  constructor() {
    this.memoryChunks = [];
    this.isIndexed = false;
  }

  /**
   * Fast Knowledge Base Indexing - Loads from MongoDB in 1 query, or generates locally in 5ms.
   * Completely avoids sequential network loops that cause Vercel 504 timeouts.
   */
  async indexKnowledgeBase(forceReload = false) {
    if (this.isIndexed && this.memoryChunks.length > 0 && !forceReload) {
      return { total: this.memoryChunks.length, cached: true };
    }

    try {
      const dbAvailable = isDbConnected();

      // 1. Try single fast batch load from MongoDB
      if (dbAvailable) {
        try {
          const dbChunks = await KnowledgeChunk.find({}).lean().maxTimeMS(3000);
          if (dbChunks && dbChunks.length > 0) {
            this.memoryChunks = dbChunks.map((c) => ({
              ...c,
              embedding: (c.embedding && c.embedding.length > 0)
                ? c.embedding
                : generateLocalFallbackEmbedding(`${c.title}\n${c.content}`),
            }));
            this.isIndexed = true;
            console.log(`[RAGService] Fast-loaded ${this.memoryChunks.length} chunks from MongoDB Atlas in 1 query.`);
            return { total: this.memoryChunks.length, cached: true };
          }
        } catch (dbErr) {
          console.warn('[RAGService] MongoDB chunk read warning, utilizing memory knowledgebase:', dbErr.message);
        }
      }

      // 2. Generate in-memory chunks from local markdown knowledge base
      const generatedChunks = generateKnowledgeChunks();
      if (generatedChunks.length === 0) {
        return { total: 0, cached: false };
      }

      for (const chunk of generatedChunks) {
        chunk.embedding = generateLocalFallbackEmbedding(`${chunk.title}\n${chunk.content}`);
      }

      this.memoryChunks = generatedChunks;
      this.isIndexed = true;
      console.log(`[RAGService] Successfully prepared ${generatedChunks.length} knowledge chunks in memory.`);

      // 3. Asynchronously background sync to MongoDB without blocking execution
      if (dbAvailable) {
        KnowledgeChunk.insertMany(generatedChunks, { ordered: false }).catch(() => {});
      }

      return { total: generatedChunks.length, cached: false };
    } catch (err) {
      console.error(`[RAGService] Error during knowledge base indexing:`, err);
      return { total: this.memoryChunks.length, error: err.message };
    }
  }


  /**
   * Retrieve the top-K most relevant knowledge passages for a user query
   */
  async retrieveRelevantContext(query, topK = 4) {
    if (!this.isIndexed || this.memoryChunks.length === 0) {
      await this.indexKnowledgeBase();
    }

    if (this.memoryChunks.length === 0) {
      return [];
    }

    const queryEmbedding = await generateEmbedding(query);
    const cleanQuery = query.toLowerCase();

    const scoredChunks = this.memoryChunks.map((chunk) => {
      let score = cosineSimilarity(queryEmbedding, chunk.embedding);

      // Keyword / Intent Boosting
      const titleLower = chunk.title.toLowerCase();
      const contentLower = chunk.content.toLowerCase();

      // Products boost
      if (
        (cleanQuery.includes('product') || cleanQuery.includes('option') || cleanQuery.includes('loan') || cleanQuery.includes('funding')) &&
        chunk.category === 'products'
      ) {
        score += 0.25;
      }

      // Specific product match boost
      if (
        (cleanQuery.includes('mca') || cleanQuery.includes('cash advance')) &&
        (titleLower.includes('merchant cash advance') || chunk.chunkId.includes('merchant-cash-advance'))
      ) {
        score += 0.4;
      }
      if (
        cleanQuery.includes('line of credit') &&
        (titleLower.includes('line of credit') || chunk.chunkId.includes('line-of-credit'))
      ) {
        score += 0.4;
      }
      if (
        cleanQuery.includes('equipment') &&
        (titleLower.includes('equipment') || chunk.chunkId.includes('equipment'))
      ) {
        score += 0.4;
      }

      // Qualification boost
      if (
        (cleanQuery.includes('qualif') || cleanQuery.includes('require') || cleanQuery.includes('eligible') || cleanQuery.includes('minimum revenue') || cleanQuery.includes('credit score') || cleanQuery.includes('bad credit')) &&
        chunk.category === 'qualifications'
      ) {
        score += 0.35;
      }

      // Objection Rebuttal boost
      if (chunk.category === 'rebuttals') {
        const objection = (chunk.metadata?.objection || '').toLowerCase();
        if (cleanQuery.includes(objection)) {
          score += 0.3;
        }
      }

      // Comparison boost
      if (
        (cleanQuery.includes('compare') || cleanQuery.includes('difference between') || cleanQuery.includes('bank loan vs') || cleanQuery.includes('credit card vs')) &&
        chunk.category === 'comparison'
      ) {
        score += 0.4;
      }

      // Decline boost
      if (
        (cleanQuery.includes('decline') || cleanQuery.includes('reject') || cleanQuery.includes('denied')) &&
        chunk.category === 'decline_advice'
      ) {
        score += 0.35;
      }

      // Direct term presence
      const queryWords = cleanQuery.replace(/[^\w\s]/g, '').split(/\s+/).filter((w) => w.length > 3);
      for (const w of queryWords) {
        if (titleLower.includes(w)) score += 0.1;
        else if (contentLower.includes(w)) score += 0.04;
      }

      return {
        chunkId: chunk.chunkId,
        source: chunk.source,
        category: chunk.category,
        title: chunk.title,
        content: chunk.content,
        score,
      };
    });

    // Sort descending by score
    scoredChunks.sort((a, b) => b.score - a.score);

    return scoredChunks.slice(0, topK);
  }
}

export const ragService = new RAGService();
