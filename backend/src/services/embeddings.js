import { Ollama } from 'ollama';

const ollama = new Ollama({ 
  host: process.env.OLLAMA_BASE_URL || 'http://localhost:11434' 
});

/**
 * Generate embeddings for text using Ollama
 */
export async function generateEmbedding(text) {
  try {
    if (!text || text.trim().length === 0) {
      throw new Error('Text cannot be empty');
    }

    const response = await ollama.embeddings({
      model: 'nomic-embed-text',
      prompt: text.substring(0, 2000) // Limit to 2000 chars
    });

    if (!response.embedding || response.embedding.length === 0) {
      throw new Error('Failed to generate embedding');
    }

    return response.embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error(`Failed to generate embedding: ${error.message}`);
  }
}

/**
 * Generate embeddings for multiple texts
 */
export async function generateBatchEmbeddings(texts) {
  try {
    const embeddings = await Promise.all(
      texts.map(text => generateEmbedding(text))
    );
    return embeddings;
  } catch (error) {
    console.error('Error generating batch embeddings:', error);
    throw new Error('Failed to generate batch embeddings');
  }
}

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(vec1, vec2) {
  if (!vec1 || !vec2) {
    throw new Error('Both vectors are required');
  }

  if (vec1.length !== vec2.length) {
    throw new Error(`Vector dimensions must match: ${vec1.length} vs ${vec2.length}`);
  }

  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i];
    norm1 += vec1[i] * vec1[i];
    norm2 += vec2[i] * vec2[i];
  }

  norm1 = Math.sqrt(norm1);
  norm2 = Math.sqrt(norm2);

  if (norm1 === 0 || norm2 === 0) {
    return 0;
  }

  return dotProduct / (norm1 * norm2);
}

/**
 * Find most similar embeddings
 */
export function findSimilarDocuments(queryEmbedding, documents, topK = 3) {
  if (!queryEmbedding || !documents || documents.length === 0) {
    return [];
  }

  const similarities = documents.map(doc => {
    try {
      const similarity = cosineSimilarity(queryEmbedding, doc.embedding);
      return {
        ...doc,
        similarity: similarity
      };
    } catch (error) {
      console.error('Error calculating similarity for document:', doc.id, error);
      return {
        ...doc,
        similarity: 0
      };
    }
  });

  return similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);
}

/**
 * Normalize vector (convert to unit vector)
 */
export function normalizeVector(vector) {
  const magnitude = Math.sqrt(
    vector.reduce((sum, val) => sum + val * val, 0)
  );
  
  if (magnitude === 0) {
    return vector;
  }
  
  return vector.map(val => val / magnitude);
}