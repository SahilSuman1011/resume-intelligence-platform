import { v4 as uuidv4 } from 'uuid';
import { generateEmbedding, findSimilarDocuments } from './embeddings.js';

/**
 * In-memory vector store for resume documents
 */
class VectorStore {
  constructor() {
    this.documents = [];
    this.resumeIndex = new Map(); // resumeId -> document indices
  }

  /**
   * Add document with embedding to the store
   */
  async addDocument({ text, metadata = {} }) {
    try {
      const id = uuidv4();
      
      console.log('Generating embedding for chunk...');
      const embedding = await generateEmbedding(text);

      const document = {
        id,
        text,
        embedding,
        metadata,
        timestamp: new Date().toISOString()
      };

      this.documents.push(document);

      // Index by resume ID for quick lookup
      if (metadata.resumeId) {
        if (!this.resumeIndex.has(metadata.resumeId)) {
          this.resumeIndex.set(metadata.resumeId, []);
        }
        this.resumeIndex.get(metadata.resumeId).push(this.documents.length - 1);
      }

      console.log('Document added to vector store:', id);
      return id;
    } catch (error) {
      console.error('Error adding document:', error);
      throw error;
    }
  }

  /**
   * Add multiple documents in batch
   */
  async addDocuments(docs) {
    const ids = [];
    for (const doc of docs) {
      try {
        const id = await this.addDocument(doc);
        ids.push(id);
      } catch (error) {
        console.error('Failed to add document:', error);
      }
    }
    return ids;
  }

  /**
   * Search for similar documents
   */
  async search(query, topK = 3, filter = {}) {
    try {
      console.log('Searching vector store for:', query.substring(0, 50) + '...');
      
      const queryEmbedding = await generateEmbedding(query);

      let filteredDocs = this.documents;

      // Apply metadata filters
      if (Object.keys(filter).length > 0) {
        filteredDocs = this.documents.filter(doc => {
          return Object.entries(filter).every(([key, value]) => {
            return doc.metadata[key] === value;
          });
        });
      }

      console.log('Filtered documents:', filteredDocs.length);

      if (filteredDocs.length === 0) {
        return [];
      }

      const results = findSimilarDocuments(queryEmbedding, filteredDocs, topK);

      console.log('Found results:', results.length);
      return results.map(result => ({
        id: result.id,
        text: result.text,
        metadata: result.metadata,
        similarity: result.similarity
      }));
    } catch (error) {
      console.error('Error searching documents:', error);
      throw error;
    }
  }

  /**
   * Get all documents for a specific resume
   */
  getResumeDocuments(resumeId) {
    const indices = this.resumeIndex.get(resumeId) || [];
    return indices
      .map(index => this.documents[index])
      .filter(doc => doc !== null);
  }

  /**
   * Delete documents by resume ID
   */
  deleteResumeDocuments(resumeId) {
    const indices = this.resumeIndex.get(resumeId) || [];
    
    // Mark documents as deleted
    indices.forEach(index => {
      if (this.documents[index]) {
        this.documents[index] = null;
      }
    });

    this.resumeIndex.delete(resumeId);

    // Clean up null entries
    this.documents = this.documents.filter(doc => doc !== null);
    
    // Rebuild index
    this.rebuildIndex();
  }

  /**
   * Rebuild the resume index after deletions
   */
  rebuildIndex() {
    this.resumeIndex.clear();
    
    this.documents.forEach((doc, index) => {
      if (doc && doc.metadata.resumeId) {
        if (!this.resumeIndex.has(doc.metadata.resumeId)) {
          this.resumeIndex.set(doc.metadata.resumeId, []);
        }
        this.resumeIndex.get(doc.metadata.resumeId).push(index);
      }
    });
  }

  /**
   * Get total document count
   */
  getDocumentCount() {
    return this.documents.filter(doc => doc !== null).length;
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      totalDocuments: this.getDocumentCount(),
      totalResumes: this.resumeIndex.size,
      memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024 // MB
    };
  }

  /**
   * Clear all documents
   */
  clear() {
    this.documents = [];
    this.resumeIndex.clear();
    console.log('Vector store cleared');
  }
}

// Singleton instance
const vectorStore = new VectorStore();

export default vectorStore;