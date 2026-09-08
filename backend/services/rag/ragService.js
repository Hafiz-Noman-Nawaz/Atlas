import { KnowledgeChunk } from '../../models/KnowledgeChunk.js';
import { generateKnowledgeChunks } from './chunker.js';
import { generateEmbedding, cosineSimilarity } from './embeddingService.js';
import { isDbConnected } from '../../config/db.js';

class RAGService {
  constructor() {
    this.memoryChunks = [];
    this.isIndexed = false;
  }

  /**
   * Index knowledge base chunks into MongoDB Atlas & local memory buffer
   */
  async indexKnowledgeBase(forceReload = false) {
    if (this.isIndexed && !forceReload) {
      return { total: this.memoryChunks.length, cached: true };
    }

    try {
      const generatedChunks = generateKnowledgeChunks();
      if (generatedChunks.length === 0) {
        return { total: 0, cached: false };
      }

      console.log(`[RAGService] Indexing ${generatedChunks.length} chunks into knowledge base...`);

      // If DB is connected, check existing chunks
      const dbAvailable = isDbConnected();
      const processedChunks = [];

      for (const chunk of generatedChunks) {
        let embedding = [];
        
        // If DB has this chunk with embedding, reuse it
        if (dbAvailable) {
          const existing = await KnowledgeChunk.findOne({ chunkId: chunk.chunkId }).lean();
          if (existing && existing.embedding && existing.embedding.length > 0) {
            embedding = existing.embedding;
          }
        }

        // Generate embedding if not found
        if (embedding.length === 0) {
          const textToEmbed = `${chunk.title}\n${chunk.content}`;
          embedding = await generateEmbedding(textToEmbed);
        }

        chunk.embedding = embedding;
        processedChunks.push(chunk);

        // Upsert to MongoDB if connected
        if (dbAvailable) {
          await KnowledgeChunk.findOneAndUpdate(
            { chunkId: chunk.chunkId },
            {
              $set: {
                source: chunk.source,
                category: chunk.category,
                title: chunk.title,
                content: chunk.content,
                embedding,
                metadata: chunk.metadata,
              },
            },
            { upsert: true, new: true }
          );
        }
      }

      this.memoryChunks = processedChunks;
      this.isIndexed = true;
      console.log(`[RAGService] Successfully indexed ${processedChunks.length} chunks.`);

      return { total: processedChunks.length, cached: false };
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
