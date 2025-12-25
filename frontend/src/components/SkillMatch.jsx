import { useState } from 'react';
import { Target, CheckCircle2, XCircle, TrendingUp, Award, Info } from 'lucide-react';

function SkillMatch({ matchResult, currentJob, currentResume }) {
  const [showDetails, setShowDetails] = useState(true);

  if (!matchResult) {
    return (
      <div className="card">
        <div className="flex items-center space-x-3 mb-6">
          <Target className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-gray-800">Skill Match Analysis</h2>
        </div>
        <div className="text-center py-12">
          <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">No match data available</p>
          <p className="text-sm text-gray-400">
            Upload a resume for a job to see skill matching analysis
          </p>
        </div>
      </div>
    );
  }

  const { matchPercentage, matchedSkills, missingSkills, extraSkills } = matchResult;

  const getMatchColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMatchBgColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-100';
    if (percentage >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getMatchStatus = (percentage) => {
    if (percentage >= 80) return 'Excellent Match';
    if (percentage >= 60) return 'Good Match';
    if (percentage >= 40) return 'Fair Match';
    return 'Poor Match';
  };

  const getMatchIcon = (percentage) => {
    if (percentage >= 80) return '🌟';
    if (percentage >= 60) return '👍';
    if (percentage >= 40) return '⚡';
    return '⚠️';
  };

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Target className="w-6 h-6 text-primary" />
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Skill Match Analysis</h2>
            <p className="text-sm text-gray-600">
              {currentResume?.name || 'Resume'} vs {currentJob?.title || 'Job'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-primary hover:text-primary-dark font-medium"
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>
      </div>

      {/* Match Score Card */}
      <div className={`rounded-xl p-6 mb-6 ${getMatchBgColor(matchPercentage)} border-2 ${
        matchPercentage >= 80 ? 'border-green-300' :
        matchPercentage >= 60 ? 'border-yellow-300' : 'border-red-300'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Overall Match Score</p>
            <div className="flex items-baseline space-x-2">
              <span className={`text-5xl font-bold ${getMatchColor(matchPercentage)}`}>
                {matchPercentage}%
              </span>
              <span className="text-2xl">{getMatchIcon(matchPercentage)}</span>
            </div>
            <p className={`text-sm font-semibold mt-2 ${getMatchColor(matchPercentage)}`}>
              {getMatchStatus(matchPercentage)}
            </p>
          </div>
          <div className="text-right">
            <Award className={`w-20 h-20 ${getMatchColor(matchPercentage)} opacity-20`} />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-white rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                matchPercentage >= 80 ? 'bg-green-600' :
                matchPercentage >= 60 ? 'bg-yellow-600' : 'bg-red-600'
              }`}
              style={{ width: `${matchPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <CheckCircle2 className="w-6 h-6 text-green-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-green-600">{matchedSkills?.length || 0}</p>
          <p className="text-xs text-gray-600">Matched Skills</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <XCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-red-600">{missingSkills?.length || 0}</p>
          <p className="text-xs text-gray-600">Missing Skills</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <TrendingUp className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-blue-600">{extraSkills?.length || 0}</p>
          <p className="text-xs text-gray-600">Extra Skills</p>
        </div>
      </div>

      {/* Detailed Skills Breakdown */}
      {showDetails && (
        <div className="space-y-4">
          {/* Matched Skills */}
          {matchedSkills && matchedSkills.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-gray-800">Matched Skills</h3>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  {matchedSkills.length}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {matchedSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium border border-green-300"
                  >
                    ✓ {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Missing Skills */}
          {missingSkills && missingSkills.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <XCircle className="w-5 h-5 text-red-600" />
                <h3 className="font-semibold text-gray-800">Missing Skills</h3>
                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                  {missingSkills.length}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {missingSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-sm font-medium border border-red-300"
                  >
                    ✗ {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Extra Skills */}
          {extraSkills && extraSkills.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-800">Additional Skills</h3>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  {extraSkills.length}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {extraSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium border border-blue-300"
                  >
                    + {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recommendation */}
      <div className="mt-6 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
        <div className="flex items-start space-x-2">
          <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold mb-1">💡 Recommendation</p>
            {matchPercentage >= 80 ? (
              <p>This candidate is an excellent match! The skill alignment is strong and they meet most requirements.</p>
            ) : matchPercentage >= 60 ? (
              <p>Good candidate with solid skill match. Consider for interview to assess missing skills.</p>
            ) : matchPercentage >= 40 ? (
              <p>Fair match. Candidate shows some relevant skills but has significant gaps in key requirements.</p>
            ) : (
              <p>Limited skill match. Consider if the candidate shows strong potential for rapid learning.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SkillMatch;
