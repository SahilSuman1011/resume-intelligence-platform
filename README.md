# 🤖 AI-Enabled Job Resume Intelligence Platform

A full-stack AI-powered platform for analyzing job descriptions, matching resumes, ranking candidates, and providing intelligent chat capabilities using RAG (Retrieval Augmented Generation).
![alt text](image.png)
## ✨ Features

- 📋 **Job Analysis**: Extract skills from job descriptions using AI with keyword fallback
- 📄 **Resume Processing**: Upload and analyze PDF/TXT resumes with automatic skill extraction
- 🎯 **Smart Matching**: Calculate skill match percentage with synonym recognition and fuzzy matching
- 🏆 **Candidate Ranking**: Automatically rank top 10 candidates by match score
- 💬 **AI Chat**: Ask questions about resumes using RAG with context retrieval
- 🧠 **Conversation Memory**: Persistent chat history with session management
- 🆓 **Zero Cost**: Uses free local AI (Ollama) - no API keys or cloud costs

## 🛠️ Tech Stack

### Frontend
- **React 19.2** - UI library with hooks
- **Vite 7.x** - Fast build tool & HMR dev server
- **Tailwind CSS 3.4** - Utility-first styling with custom components
- **Axios 1.13** - HTTP client for API requests
- **Lucide React** - Modern icon library

### Backend
- **Node.js v18+** - Runtime with ES modules
- **Express 4.18** - Web framework
- **Multer** - File upload middleware
- **pdf-parse** - PDF text extraction
- **Cheerio** - HTML parsing for job URL scraping
- **Natural** - Keyword extraction fallback

### AI/ML
- **Ollama** - Local LLM (llama3.2:3b)
- **LangChain 0.3.x** - AI orchestration framework
- **nomic-embed-text** - Embeddings (768D vectors)
- **Custom Vector Store** - In-memory cosine similarity search

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** v18 or higher ([Download](https://nodejs.org/))
- **Ollama** ([Download](https://ollama.ai/))
- **Git** (optional)

## 🚀 Quick Start

### 1. Install Ollama & Models

```bash
# Install Ollama from https://ollama.ai

# Pull required models
ollama pull llama3.2:3b
ollama pull nomic-embed-text

# Verify installation
ollama list
```

### 2. Clone or Download Project

```bash
git clone <https://github.com/SahilSuman1011/resume-intelligence-platform>
cd resume-intelligence-platform
```

### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file (Windows)
copy .env.example .env
# Or (Mac/Linux)
cp .env.example .env

# Create required directories (Windows)
mkdir uploads
# Or (Mac/Linux)
mkdir -p uploads data/vectors

# Start backend server
npm run dev
```

Backend will run on `http://localhost:5000`

### 4. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env file (Windows)
copy .env.example .env
# Or (Mac/Linux)
cp .env.example .env

# Start frontend
npm run dev
```

Frontend will run on `http://localhost:5173`

### 5. Access Application

Open your browser and navigate to:
```
http://localhost:5173
```

## 📁 Project Structure

```
resume-intelligence-platform/
├── backend/
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # Data models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Utility functions
│   │   └── server.js       # Entry point
│   ├── uploads/            # Temporary file storage
│   ├── data/vectors/       # Vector embeddings
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/     # React components
    │   ├── services/       # API client
    │   ├── utils/          # Helper functions
    │   ├── App.jsx         # Main app
    │   └── main.jsx        # Entry point
    └── package.json
```

## 🎯 How to Use

### 1. Create a Job

1. Go to "Job Description" tab
2. Enter job title and detailed description (minimum 20 characters)
3. Click "Analyze Job & Extract Skills"
4. AI extracts required skills automatically (with keyword fallback if needed)
5. Review extracted skills - typically 10-20 skills identified

### 2. Upload Resume

1. Go to "Upload Resume" tab
2. Drag & drop or click to upload PDF/TXT
3. System automatically matches with current job
4. View match percentage and missing skills

### 3. View Rankings

1. Go to "Top Resumes" tab
2. See all resumes ranked by match percentage
3. View detailed breakdown for each candidate

### 4. Chat with Resume

1. Go to "Chat with Resume" tab
2. Ask questions about the resume
3. AI answers using RAG (retrieves relevant sections)
4. Conversation history is maintained

## 📊 Example Queries

**Job Analysis:**
- "Backend Engineer with Java, MongoDB, Kafka experience"
- Extracts: Java, MongoDB, Kafka, data structures, algorithms, distributed systems
- Synonym matching: "mongo" matches "MongoDB", "git" matches "version control"

**Resume Chat:**
- "What are the candidate's key technical skills?"
- "How many years of experience does the candidate have?"
- "Does the candidate have frontend development experience?"
- "What programming languages does the candidate know?"

## 🔧 Configuration

### Backend (.env)
```env
PORT=5000
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:3b
FRONTEND_URL=http://localhost:5173
MAX_FILE_SIZE=10485760
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## 🐛 Troubleshooting

### Ollama Not Running
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Mac/Linux
lsof -ti:5000 | xargs kill -9

# Windows
netstat -ano | findstr :5000
# Note the PID, then:
taskkill /PID <PID> /F

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9  # Mac/Linux
netstat -ano | findstr :5000   # Windows
```

### CORS Er`uploads/` directory exists in backend folder
- Verify file size < 10MB (configurable in .env)
- Ensure file format is PDF or TXT only
- Check backend console for detailed error messages

### Slow AI Responses
- First API call loads the model into memory (40-75s is normal for CPU)
- Processing time depends on your hardware (CPU vs GPU)
- Ensure Ollama is running: `ollama list`
- For faster performance, use GPU or smaller model: `ollama pull llama3.2:1b`
- Current times are acceptable for CPU-only processing
- Check FRONTEND_URL in backend/.env

### Upload Errors
- Check if `uploads/` directory exists in backend folder
- Verify file size < 10MB (configurable in .env)
- Ensure file format is PDF or TXT only
- Check backend console for detailed error messages

### Job Description Too Short Error
- Job descriptions must be at least 20 characters
- Provide detailed job requirements for better skill extraction
- If AI extraction fails, system automatically falls back to keyword matching

## 📈 Performance

**Optimized Settings** (num_predict: 150, num_ctx: 1024, temperature: 0.3):
- **First AI Call**: 40-75 seconds (model loading + inference)
- **Subsequent Calls**: 40-60 seconds (generation time)
- **Skill Extraction**: 40-75 seconds per document
- **Resume Upload**: 40-70 seconds (parsing + skill extraction + embedding)
- **Chat Response**: 5-15 seconds (RAG retrieval + generation)
- **Match Calculation**: <1 second (pure computation)

**Note**: Performance depends heavily on CPU/GPU. Times shown are for CPU-only processing. GPU acceleration can provide 10-100x speedup.

## 🔐 Security Notes

**Current Implementation** (Prototype):
- No authentication
- In-memory storage
- No data encryption

**For Production**:
- Add JWT authentication
- Use PostgreSQL/MongoDB
- Implement HTTPS
- Add rate limiting
- Sanitize inputs

## 🚦 API Endpoints

### Jobs
```
POST   /api/jobs              - Create job
GET    /api/jobs              - Get all jobs
GET    /api/jobs/:id          - Get job by ID
DELETE /api/jobs/:id          - Delete job
```

### Resumes
```
POST   /api/resumes/upload                    - Upload resume
GET    /api/resumes/:id                       - Get resume
GET    /api/resumes/:id/compare/:jobId        - Compare with job
GET    /api/resumes/ranking/job/:jobId        - Get top 10 for job
```

### Chat
```
POST   /api/chat                     - Send message
GET    /api/chat/sessions/:id        - Get chat history
DELETE /api/chat/sessions/:id        - Clear history
```

## 🎓 Assignment Criteria Met

✅ **AI Orchestration**: Multiple AI operations coordinated
✅ **RAG Implementation**: Complete retrieval-augmented generation
✅ **Memory-Aware Systems**: Persistent conversation memory
✅ **MERN + LLM Integration**: Full stack with AI
✅ **Core Features**: All 7 required features implemented
✅ **Extended AI**: Top 10 ranking, chat, memory
✅ **Free Solution**: Zero cost with Ollama

## 📝 License

This project is for educational purposes.

## 🤝 Contributing

Contributions welcome! Feel free to submit pull requests.

## 📧 Support

For issues or questions, please open a GitHub issue.

---

**Built with ❤️ using React, Node.js, and Ollama**