import { useState } from 'react';
import Layout from './components/Layout';
import JobInput from './components/JobInput';
import ResumeUpload from './components/ResumeUpload';
import SkillMatch from './components/SkillMatch';
import ChatInterface from './components/ChatInterface';
import ResumeRanking from './components/ResumeRanking';

function App() {
  const [currentJob, setCurrentJob] = useState(null);
  const [currentResume, setCurrentResume] = useState(null);
  const [matchResult, setMatchResult] = useState(null);
  const [activeTab, setActiveTab] = useState('job');

  const handleJobCreated = (job) => {
    setCurrentJob(job);
    setActiveTab('resume');
  };

  const handleResumeUploaded = (resume, match) => {
    setCurrentResume(resume);
    setMatchResult(match);
    if (match) {
      setActiveTab('match');
    }
  };

  const tabs = [
    { id: 'job', label: 'Job Description', icon: '📋' },
    { id: 'resume', label: 'Upload Resume', icon: '📄' },
    { id: 'match', label: 'Skill Match', icon: '🎯' },
    { id: 'ranking', label: 'Top Resumes', icon: '🏆' },
    { id: 'chat', label: 'Chat with Resume', icon: '💬' },
  ];

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          AI Resume Intelligence Platform
        </h1>
        <p className="text-gray-600">
          Analyze job descriptions, match resumes, and chat with AI
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 font-medium transition-colors duration-200 border-b-2 ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'job' && (
          <JobInput onJobCreated={handleJobCreated} />
        )}

        {activeTab === 'resume' && (
          <ResumeUpload 
            currentJob={currentJob}
            onResumeUploaded={handleResumeUploaded}
          />
        )}

        {activeTab === 'match' && (
          <SkillMatch 
            matchResult={matchResult}
            currentResume={currentResume}
            currentJob={currentJob}
          />
        )}

        {activeTab === 'ranking' && (
          <ResumeRanking currentJob={currentJob} />
        )}

        {activeTab === 'chat' && (
          <ChatInterface currentResume={currentResume} />
        )}
      </div>
    </Layout>
  );
}

export default App;