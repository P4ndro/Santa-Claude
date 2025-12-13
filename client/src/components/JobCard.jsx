import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function JobCard({ job }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleApply = async () => {
    try {
      setLoading(true);
      setError('');
      // Apply to this specific job (starts application interview with job's questions)
      const data = await api.applyToJob(job.id);
      navigate(`/interview/${data.interviewId}`);
    } catch (err) {
      console.error('Failed to apply:', err);
      setError(err.message || 'Failed to apply');
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700 hover:border-emerald-500 transition-colors">
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-white mb-2">{job.title}</h3>
        <p className="text-emerald-400 font-medium">{job.company}</p>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-slate-400 text-sm">
          <span className="mr-2">📍</span>
          {job.location}
        </div>
        <div className="flex items-center text-slate-400 text-sm">
          <span className="mr-2">💼</span>
          {job.type || job.employmentType || 'Full-time'}
        </div>
        <div className="flex items-center text-slate-400 text-sm">
          <span className="mr-2">📅</span>
          {job.posted}
        </div>
        {job.skills && job.skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {job.skills.slice(0, 3).map((skill, i) => (
              <span key={i} className="text-xs px-2 py-0.5 bg-slate-700 text-slate-300 rounded">
                {skill}
              </span>
            ))}
            {job.skills.length > 3 && (
              <span className="text-xs text-slate-500">+{job.skills.length - 3}</span>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="text-red-400 text-sm mb-2">{error}</p>
      )}

      <button
        onClick={handleApply}
        disabled={loading}
        className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 disabled:cursor-not-allowed text-white font-medium rounded-md transition-colors"
      >
        {loading ? 'Applying...' : 'Apply Now'}
      </button>
    </div>
  );
}
