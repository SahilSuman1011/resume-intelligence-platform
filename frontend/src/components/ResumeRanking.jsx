import { useState, useEffect } from 'react';
import { Trophy, Loader, Award, RefreshCw } from 'lucide-react';
import { resumeAPI } from '../services/api';

function ResumeRanking({ currentJob }) {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentJob) {
      fetchRankings();
    }
  }, [currentJob]);

  const fetchRankings = async () => {
    if (!currentJob) return;

    setLoading(true);
    setError('');

    try {
      const data = await resumeAPI.getTopForJob(currentJob.id);
      setRankings(data.topResumes || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch rankings');
      console.error('Error fetching rankings:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMedalIcon = (rank) => {
    if (rank === 0) return '🥇';
    if (rank === 1) return '🥈';
    if (rank === 2) return '🥉';
    return `#${rank + 1}`;
  };

  const getMatchColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getMatchBadgeColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-100 text-green-800 border-green-300';
    if (percentage >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  if (!currentJob) {
    return (
      <div className="card">
        <div className="flex items-center space-x-3 mb-6">
          <Trophy className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-gray-800">Top 10 Resumes</h2>
        </div>
        <div className="text-center py-12">
          <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            Create a job first to see resume rankings
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Trophy className="w-6 h-6 text-primary" />
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Top 10 Resumes
            </h2>
            <p className="text-sm text-gray-600">
              For: {currentJob.title}
            </p>
          </div>
        </div>
        <button
          onClick={fetchRankings}
          disabled={loading}
          className="btn btn-secondary text-sm flex items-center space-x-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {loading && rankings.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      ) : rankings.length === 0 ? (
        <div className="text-center py-12">
          <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">
            No resumes uploaded yet
          </p>
          <p className="text-sm text-gray-400">
            Upload resumes to see rankings
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {rankings.map((resume, index) => (
            <div
              key={resume.resumeId}
              className={`flex items-center justify-between p-4 border-2 rounded-lg transition-all duration-200 ${
                index === 0 
                  ? 'border-yellow-400 bg-yellow-50' 
                  : index === 1
                  ? 'border-gray-400 bg-gray-50'
                  : index === 2
                  ? 'border-orange-400 bg-orange-50'
                  : 'border-gray-200 hover:border-primary hover:shadow-md'
              }`}
            >
              <div className="flex items-center space-x-4 flex-1">
                {/* Rank Badge */}
                <div className={`text-2xl font-bold w-12 text-center ${
                  index < 3 ? 'scale-125' : ''
                }`}>
                  {getMedalIcon(index)}
                </div>
                
                {/* Resume Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 truncate">
                    {resume.filename}
                  </h3>
                  <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                    <span>
                      Skills: {resume.totalMatched}/{resume.totalRequired}
                    </span>
                    <span>•</span>
                    <span>
                      {new Date(resume.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {/* Matched Skills Preview */}
                  {resume.matchedSkills && resume.matchedSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {resume.matchedSkills.slice(0, 5).map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                      {resume.matchedSkills.length > 5 && (
                        <span className="px-2 py-0.5 text-gray-500 text-xs">
                          +{resume.matchedSkills.length - 5} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Match Score */}
              <div className="flex items-center space-x-4 ml-4">
                <div className="text-right">
                  <div className={`text-3xl font-bold ${
                    resume.matchPercentage >= 80 ? 'text-green-600' :
                    resume.matchPercentage >= 60 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {resume.matchPercentage}%
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Match Score
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-24">
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getMatchColor(resume.matchPercentage)} transition-all duration-500`}
                      style={{ width: `${resume.matchPercentage}%` }}
                    />
                  </div>
                  <div className={`text-xs text-center mt-1 px-2 py-0.5 rounded-full border ${getMatchBadgeColor(resume.matchPercentage)}`}>
                    {resume.matchPercentage >= 80 ? 'Excellent' :
                     resume.matchPercentage >= 60 ? 'Good' : 'Fair'}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Summary Stats */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {rankings.length}
                </div>
                <div className="text-sm text-blue-700">Total Candidates</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {rankings.filter(r => r.matchPercentage >= 80).length}
                </div>
                <div className="text-sm text-green-700">Excellent Matches</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {rankings.filter(r => r.matchPercentage >= 60 && r.matchPercentage < 80).length}
                </div>
                <div className="text-sm text-yellow-700">Good Matches</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResumeRanking;