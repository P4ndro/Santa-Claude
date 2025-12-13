import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../authContext';
import Navbar from '../components/Navbar';
import JobCard from '../components/JobCard';
import { api } from '../api';

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  const [startingInterview, setStartingInterview] = useState(false);
  const [error, setError] = useState('');
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  // Redirect company users to company dashboard (after hooks are declared)
  useEffect(() => {
    if (user?.role === 'company') {
      navigate('/company-dashboard', { replace: true });
    }
  }, [user?.role, navigate]);

  // Fetch jobs from API
  useEffect(() => {
    async function fetchJobs() {
      try {
        setLoadingJobs(true);
        const data = await api.listJobs();
        setJobs(data.jobs || []);
      } catch (err) {
        console.error('Failed to load jobs:', err);
        setError(err.message || 'Failed to load jobs');
      } finally {
        setLoadingJobs(false);
      }
    }

    // Only fetch jobs if user is a candidate
    if (user?.role === 'candidate') {
      fetchJobs();
    } else {
      setLoadingJobs(false);
    }
  }, [user?.role]);

  // NOW we can have conditional returns AFTER all hooks
  // Don't render anything for companies (they should be redirected)
  if (user?.role === 'company') {
    return null;
  }

  // Candidate View
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">
            Welcome back, {user?.email?.split('@')[0]}!
          </h1>
          <p className="text-black">Find your next opportunity</p>
        </div>

        <div className="mb-6">
          <button
            onClick={async () => {
              try {
                setStartingInterview(true);
                setError('');
                const data = await api.startInterview();
                navigate(`/interview/${data.interviewId}`);
              } catch (err) {
                setError(err.message || 'Failed to start interview');
                setStartingInterview(false);
              }
            }}
            disabled={startingInterview}
            className="inline-block px-6 py-3 bg-black hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            {startingInterview ? 'Starting...' : 'Start Interview'}
          </button>
          {error && (
            <p className="mt-2 text-black text-sm">{error}</p>
          )}
        </div>

        {loadingJobs ? (
          <div className="text-center py-12">
            <p className="text-black">Loading jobs...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-black">No jobs available at the moment.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

