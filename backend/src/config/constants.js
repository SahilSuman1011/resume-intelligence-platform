// Application constants

export const API_VERSION = 'v1';

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['application/pdf', 'text/plain'],
  ALLOWED_EXTENSIONS: ['.pdf', '.txt'],
};

export const AI_CONFIG = {
  OLLAMA_MODEL: process.env.OLLAMA_MODEL || 'llama3.2:3b',
  EMBEDDING_MODEL: 'nomic-embed-text',
  EMBEDDING_DIMENSIONS: 768,
  TEMPERATURE: {
    EXTRACTION: 0.3,
    CHAT: 0.7,
    SUMMARY: 0.5,
  },
  MAX_TOKENS: {
    EXTRACTION: 200,
    CHAT: 300,
    SUMMARY: 150,
  },
};

export const RAG_CONFIG = {
  CHUNK_SIZE: 500,
  CHUNK_OVERLAP: 50,
  TOP_K_RESULTS: 3,
  MIN_SIMILARITY: 0.5,
};

export const MEMORY_CONFIG = {
  MAX_HISTORY_LENGTH: 50,
  CONTEXT_WINDOW: 10,
  CLEANUP_INTERVAL: 60 * 60 * 1000, // 1 hour
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
};

export const SKILL_CATEGORIES = {
  PROGRAMMING_LANGUAGES: [
    'JavaScript', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'Go', 'Rust',
    'TypeScript', 'PHP', 'Swift', 'Kotlin', 'Scala', 'R', 'MATLAB'
  ],
  FRAMEWORKS: [
    'React', 'Angular', 'Vue', 'Node.js', 'Express', 'Django', 'Flask',
    'Spring Boot', 'Next.js', 'Nuxt.js', 'Laravel', 'Ruby on Rails',
    'ASP.NET', 'FastAPI', 'NestJS'
  ],
  DATABASES: [
    'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Cassandra', 'DynamoDB',
    'SQLite', 'Oracle', 'SQL Server', 'MariaDB', 'Elasticsearch', 'Neo4j'
  ],
  CLOUD: [
    'AWS', 'Azure', 'GCP', 'Heroku', 'DigitalOcean', 'Docker',
    'Kubernetes', 'Terraform', 'Jenkins', 'CircleCI', 'GitHub Actions'
  ],
  TOOLS: [
    'Git', 'GitHub', 'GitLab', 'Bitbucket', 'JIRA', 'Confluence',
    'Postman', 'VS Code', 'IntelliJ', 'Webpack', 'Babel', 'npm', 'yarn'
  ],
  SOFT_SKILLS: [
    'Leadership', 'Communication', 'Problem Solving', 'Team Collaboration',
    'Agile', 'Scrum', 'Project Management', 'Analytical Thinking',
    'Critical Thinking', 'Time Management'
  ]
};

export const ERROR_MESSAGES = {
  FILE_TOO_LARGE: 'File size exceeds maximum limit of 10MB',
  INVALID_FILE_TYPE: 'Invalid file type. Only PDF and TXT files are allowed',
  JOB_NOT_FOUND: 'Job not found',
  RESUME_NOT_FOUND: 'Resume not found',
  SESSION_NOT_FOUND: 'Session not found',
  MISSING_REQUIRED_FIELDS: 'Missing required fields',
  EXTRACTION_FAILED: 'Failed to extract text from file',
  AI_SERVICE_ERROR: 'AI service error. Please try again',
  EMBEDDING_FAILED: 'Failed to generate embeddings',
  VECTOR_STORE_ERROR: 'Vector store operation failed',
};

export const SUCCESS_MESSAGES = {
  JOB_CREATED: 'Job created successfully',
  JOB_DELETED: 'Job deleted successfully',
  RESUME_UPLOADED: 'Resume uploaded and processed successfully',
  RESUME_DELETED: 'Resume deleted successfully',
  CHAT_MESSAGE_SENT: 'Message sent successfully',
  SESSION_CLEARED: 'Session cleared successfully',
};