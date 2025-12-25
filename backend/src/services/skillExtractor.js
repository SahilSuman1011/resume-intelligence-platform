import { Ollama } from 'ollama';

const ollama = new Ollama({ 
  host: process.env.OLLAMA_BASE_URL || 'http://localhost:11434' 
});

/**
 * Extract skills from job description using AI
 */
export async function extractJobSkills(jobDescription) {
  try {
    console.log('Extracting job skills...');
    const startTime = Date.now();
    
    // Use shorter, more focused prompt
    const prompt = `Skills in this job: ${jobDescription.substring(0, 1500)}

List:`;

    const response = await ollama.generate({
      model: process.env.OLLAMA_MODEL || 'llama3.2:3b',
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.1,
        top_p: 0.9,
        top_k: 20,
        num_predict: 80,  // Even shorter
        num_ctx: 2048,    // Smaller context window
        stop: ['\n\n', 'Note:', 'Explanation:', 'Required:', 'Preferred:']
      }
    });

    const skills = response.response
      .split(/[,\n;]/)
      .map(skill => skill.trim())
      .map(skill => skill.replace(/^[-*•]\s*/, ''))  // Remove bullets
      .map(skill => skill.replace(/^\d+\.\s*/, ''))  // Remove numbers
      .filter(skill => skill.length > 1 && skill.length < 50)
      .filter(skill => !skill.toLowerCase().includes('skill'))
      .filter(skill => !skill.toLowerCase().startsWith('and '))
      .filter(skill => !skill.toLowerCase().startsWith('or '));

    const uniqueSkills = [...new Set(skills)];
    const duration = Date.now() - startTime;
    console.log(`✓ Extracted ${uniqueSkills.length} skills in ${duration}ms`);
    
    return uniqueSkills.slice(0, 30);  // Limit to top 30
  } catch (error) {
    console.error('Error extracting job skills:', error);
    return extractSkillsKeywordBased(jobDescription);
  }
}

/**
 * Extract skills from resume using AI
 */
export async function extractResumeSkills(resumeText) {
  try {
    console.log('Extracting resume skills...');
    const startTime = Date.now();
    
    // Use shorter, more focused prompt
    const prompt = `Skills in resume: ${resumeText.substring(0, 1500)}

List:`;

    const response = await ollama.generate({
      model: process.env.OLLAMA_MODEL || 'llama3.2:3b',
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.1,
        top_p: 0.9,
        top_k: 20,
        num_predict: 80,  // Even shorter
        num_ctx: 2048,    // Smaller context window
        stop: ['\n\n', 'Note:', 'Explanation:', 'Experience:', 'Education:']
      }
    });

    const skills = response.response
      .split(/[,\n;]/)
      .map(skill => skill.trim())
      .map(skill => skill.replace(/^[-*•]\s*/, ''))  // Remove bullets
      .map(skill => skill.replace(/^\d+\.\s*/, ''))  // Remove numbers
      .filter(skill => skill.length > 1 && skill.length < 50)
      .filter(skill => !skill.toLowerCase().includes('skill'))
      .filter(skill => !skill.toLowerCase().startsWith('and '))
      .filter(skill => !skill.toLowerCase().startsWith('or '));

    const uniqueSkills = [...new Set(skills)];
    const duration = Date.now() - startTime;
    console.log(`✓ Extracted ${uniqueSkills.length} skills in ${duration}ms`);
    
    return uniqueSkills.slice(0, 30);  // Limit to top 30
  } catch (error) {
    console.error('Error extracting resume skills:', error);
    return extractSkillsKeywordBased(resumeText);
  }
}

/**
 * Fallback keyword-based skill extraction
 */
function extractSkillsKeywordBased(text) {
  console.log('Using fallback keyword extraction');
  
  const commonSkills = [
    // Programming Languages
    'JavaScript', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'Go', 'Rust',
    'TypeScript', 'PHP', 'Swift', 'Kotlin', 'Scala', 'R', 'MATLAB',
    
    // Frontend
    'React', 'Angular', 'Vue', 'HTML', 'CSS', 'jQuery', 'Bootstrap',
    'Tailwind CSS', 'Next.js', 'Nuxt.js', 'Redux', 'Webpack', 'Vite',
    
    // Backend
    'Node.js', 'Express', 'Django', 'Flask', 'Spring Boot', 'Laravel',
    'Ruby on Rails', 'ASP.NET', 'FastAPI', 'NestJS',
    
    // Databases
    'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Cassandra', 'DynamoDB',
    'SQLite', 'Oracle', 'SQL Server', 'MariaDB', 'Elasticsearch', 'Neo4j',
    
    // Cloud & DevOps
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'CircleCI',
    'GitHub Actions', 'Terraform', 'Ansible', 'CI/CD',
    
    // Tools
    'Git', 'GitHub', 'GitLab', 'Bitbucket', 'JIRA', 'Confluence',
    'Postman', 'VS Code', 'IntelliJ', 'npm', 'yarn',
    
    // AI/ML
    'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Keras',
    'Scikit-learn', 'NLP', 'Computer Vision', 'LangChain', 'OpenAI',
    
    // Soft Skills
    'Leadership', 'Communication', 'Problem Solving', 'Team Collaboration',
    'Agile', 'Scrum', 'Project Management', 'Analytical Thinking',
    'Critical Thinking', 'Time Management'
  ];

  const lowerText = text.toLowerCase();
  const foundSkills = commonSkills.filter(skill => 
    lowerText.includes(skill.toLowerCase())
  );
  
  console.log('Found skills (keyword):', foundSkills.length);
  return foundSkills;
}

/**
 * Calculate skill match between job and resume
 */
export function calculateSkillMatch(jobSkills, resumeSkills) {
  if (!jobSkills || jobSkills.length === 0) {
    return {
      matchPercentage: 0,
      matchedSkills: [],
      missingSkills: [],
      totalRequired: 0,
      totalMatched: 0
    };
  }

  const normalizedJobSkills = jobSkills.map(s => s.toLowerCase().trim());
  const normalizedResumeSkills = resumeSkills.map(s => s.toLowerCase().trim());

  // Find matched skills (fuzzy matching)
  const matchedSkills = [];
  const matchedIndices = new Set();

  normalizedJobSkills.forEach((jobSkill) => {
    const match = normalizedResumeSkills.find((resumeSkill, index) => {
      if (matchedIndices.has(index)) return false;
      
      // Exact match
      if (resumeSkill === jobSkill) return true;
      
      // Partial match (contains)
      if (resumeSkill.includes(jobSkill) || jobSkill.includes(resumeSkill)) {
        return true;
      }
      
      return false;
    });

    if (match) {
      matchedSkills.push(jobSkill);
      const index = normalizedResumeSkills.indexOf(match);
      matchedIndices.add(index);
    }
  });

  // Find missing skills
  const missingSkills = normalizedJobSkills.filter(skill => 
    !matchedSkills.includes(skill)
  );

  const matchPercentage = normalizedJobSkills.length > 0
    ? Math.round((matchedSkills.length / normalizedJobSkills.length) * 100)
    : 0;

  return {
    matchPercentage,
    matchedSkills: matchedSkills.map(s => 
      jobSkills.find(js => js.toLowerCase() === s) || s
    ),
    missingSkills: missingSkills.map(s => 
      jobSkills.find(js => js.toLowerCase() === s) || s
    ),
    totalRequired: jobSkills.length,
    totalMatched: matchedSkills.length
  };
}