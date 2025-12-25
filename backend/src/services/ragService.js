import { Ollama } from 'ollama';
import vectorStore from './vectorStore.js';

const ollama = new Ollama({ 
  host: process.env.OLLAMA_BASE_URL || 'http://localhost:11434' 
});

/**
 * Split text into chunks for better retrieval
 */
export function splitTextIntoChunks(text, chunkSize = 500, overlap = 50) {
  const words = text.split(/\s+/);
  const chunks = [];
  
  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    const chunk = words.slice(i, i + chunkSize).join(' ');
    if (chunk.trim().length > 0) {
      chunks.push(chunk);
    }
  }
  
  console.log(`Split text into ${chunks.length} chunks`);
  return chunks;
}

/**
 * Index a resume for RAG retrieval
 */
export async function indexResumeForRAG(resumeId, resumeText, metadata = {}) {
  try {
    console.log('Indexing resume:', resumeId);
    
    // Split resume into chunks
    const chunks = splitTextIntoChunks(resumeText, 500, 50);

    // Add each chunk to vector store
    const documentIds = [];
    for (let i = 0; i < chunks.length; i++) {
      try {
        const docId = await vectorStore.addDocument({
          text: chunks[i],
          metadata: {
            resumeId,
            chunkIndex: i,
            totalChunks: chunks.length,
            ...metadata
          }
        });
        documentIds.push(docId);
        console.log(`Indexed chunk ${i + 1}/${chunks.length}`);
      } catch (error) {
        console.error(`Error indexing chunk ${i}:`, error);
      }
    }

    console.log('Resume indexing complete');
    return {
      resumeId,
      chunksIndexed: documentIds.length,
      documentIds
    };
  } catch (error) {
    console.error('Error indexing resume:', error);
    throw error;
  }
}

/**
 * Query resume using RAG
 */
export async function queryResumeRAG(resumeId, question) {
  try {
    console.log('RAG Query:', question);
    
    // Retrieve relevant chunks
    const relevantDocs = await vectorStore.search(question, 3, { resumeId });

    if (relevantDocs.length === 0) {
      return {
        answer: "I couldn't find relevant information in this resume to answer your question.",
        context: [],
        confidence: 0
      };
    }

    console.log('Retrieved chunks:', relevantDocs.length);

    // Build context from retrieved chunks
    const context = relevantDocs
      .map((doc, i) => `[Context ${i + 1}] (Relevance: ${(doc.similarity * 100).toFixed(1)}%)\n${doc.text}`)
      .join('\n\n---\n\n');

    // Generate answer using LLM
    const prompt = `You are an AI assistant analyzing a resume. Answer the user's question based ONLY on the provided context from the resume.

Context from Resume:
${context}

User Question: ${question}

Instructions:
- Answer directly and concisely
- Only use information from the context above
- If the context doesn't contain the answer, say "This information is not available in the resume"
- Be professional and accurate
- Do not make assumptions or add information not in the context

Answer:`;

    console.log('Generating answer...');
    const response = await ollama.generate({
      model: process.env.OLLAMA_MODEL || 'llama3.2:3b',
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.7,
        num_predict: 300
      }
    });

    const answer = response.response.trim();
    console.log('Answer generated');

    return {
      answer: answer,
      context: relevantDocs.map(doc => ({
        text: doc.text.substring(0, 200) + '...',
        similarity: doc.similarity
      })),
      confidence: relevantDocs[0].similarity
    };
  } catch (error) {
    console.error('Error querying resume:', error);
    throw new Error(`RAG query failed: ${error.message}`);
  }
}

/**
 * Generate resume summary using RAG
 */
export async function generateResumeSummary(resumeId) {
  try {
    const allDocs = vectorStore.getResumeDocuments(resumeId);
    
    if (allDocs.length === 0) {
      throw new Error('Resume not found in vector store');
    }

    const fullText = allDocs.map(doc => doc.text).join('\n');

    const prompt = `Summarize this resume in 3-4 concise sentences, highlighting key skills, experience, and qualifications:

${fullText.substring(0, 2000)}

Summary:`;

    const response = await ollama.generate({
      model: process.env.OLLAMA_MODEL || 'llama3.2:3b',
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.5,
        num_predict: 150
      }
    });

    return response.response.trim();
  } catch (error) {
    console.error('Error generating summary:', error);
    throw error;
  }
}