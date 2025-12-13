import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import PlaceholderChart from '../components/PlaceholderChart';
import { api } from '../api';

export default function CompanyDashboard() {
  const [stats, setStats] = useState({
    totalInterviews: 0,
    averageScore: 0,
    activePositions: 0,
    candidatesThisMonth: 0,
  });

  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [error, setError] = useState('');
  const [editingJob, setEditingJob] = useState(null);
  const [showJobForm, setShowJobForm] = useState(false);
  const [jobForm, setJobForm] = useState({ 
    title: '', 
    description: '', 
    location: '', 
    level: 'Mid',
    employmentType: 'Full-time' 
  });

  const [recentCandidates, setRecentCandidates] = useState([]);
  const [commonFailureModes, setCommonFailureModes] = useState([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [selectedJobApplicants, setSelectedJobApplicants] = useState(null);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [expandedJobs, setExpandedJobs] = useState(new Set()); // Track which job descriptions are expanded

  // Function to fetch company data
  const fetchCompanyData = async () => {
    try {
      setLoadingJobs(true);
      setError('');
      
      // Fetch company's own jobs
      const jobsData = await api.getMyJobs();
      const companyJobs = (jobsData.jobs || []).map(job => {
        const jobId = job._id || job.id;
        return {
          id: jobId.toString(),
          _id: jobId,
          title: job.title,
          level: job.level,
          description: job.description,
          location: job.location,
          employmentType: job.employmentType,
          status: job.status,
          createdAt: job.createdAt,
          applicants: 0, // Will be updated when we fetch applicants
        };
      });
      setJobs(companyJobs);

      // Fetch company stats
      const statsData = await api.getMyStats();
      setStats({
        totalInterviews: statsData.interviewsCompleted || 0,
        averageScore: 0, // Calculate from applicants if needed
        activePositions: statsData.jobsPosted || companyJobs.length,
        candidatesThisMonth: statsData.totalApplicants || 0,
      });
    } catch (err) {
      console.error('Failed to load company data:', err);
      setError(err.message || 'Failed to load company data');
    } finally {
      setLoadingJobs(false);
      setLoadingAnalytics(false);
    }
  };

  // Fetch company data on mount
  useEffect(() => {
    fetchCompanyData();
  }, []);

  const handleAddJob = async () => {
    // Validate required fields
    if (!jobForm.title || !jobForm.level || !jobForm.description) {
      setError('Title, level, and description are required');
      return;
    }

    try {
      setError('');
      const response = await api.createJob({
        title: jobForm.title,
        level: jobForm.level,
        description: jobForm.description,
        location: jobForm.location,
        employmentType: jobForm.employmentType,
      });
      const job = response.job || response;
      // Refresh jobs list to get the full job object from backend
      await fetchCompanyData();
      setJobForm({ 
        title: '', 
        description: '', 
        location: '', 
        level: 'Mid',
        employmentType: 'Full-time' 
      });
      setShowJobForm(false);
      // Update stats
      setStats(prev => ({
        ...prev,
        activePositions: prev.activePositions + 1,
      }));
    } catch (err) {
      console.error('Job creation error:', err);
      setError(err.message || 'Failed to create job');
    }
  };

  const handleEditJob = (job) => {
    setEditingJob(job);
    setJobForm({ 
      title: job.title || '', 
      description: job.description || '',
      location: job.location || '',
      level: job.level || 'Mid',
      employmentType: job.employmentType || job.type || 'Full-time', // Support both formats
    });
    setShowJobForm(true);
  };

  const handleUpdateJob = async () => {
    try {
      setError('');
      const jobId = editingJob.id || editingJob._id;
      const response = await api.updateJob(jobId, {
        title: jobForm.title,
        level: jobForm.level,
        description: jobForm.description,
        location: jobForm.location,
        employmentType: jobForm.employmentType,
      });
      // Refresh jobs list to get the updated job from backend
      await fetchCompanyData();
      setEditingJob(null);
      setJobForm({ 
        title: '', 
        description: '', 
        location: '', 
        level: 'Mid',
        employmentType: 'Full-time' 
      });
      setShowJobForm(false);
    } catch (err) {
      setError(err.message || 'Failed to update job');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        setError('');
        await api.deleteJob(jobId);
        // Close applicants view if it was open for this job
        if (selectedJobApplicants?.jobId === jobId || selectedJobApplicants?.jobId === jobId.toString()) {
          setSelectedJobApplicants(null);
        }
        // Refresh jobs list to get updated data
        await fetchCompanyData();
      } catch (err) {
        setError(err.message || 'Failed to delete job');
      }
    }
  };

  const handleViewApplicants = async (jobId) => {
    try {
      setLoadingApplicants(true);
      setError('');
      const data = await api.getJobApplicants(jobId);
      
      // Update applicant count for this job in the jobs list
      setJobs(jobs.map(job => {
        const currentJobId = job.id || job._id;
        const requestedJobId = jobId?.toString() || jobId;
        if (currentJobId?.toString() === requestedJobId && data.totalApplicants !== undefined) {
          return { ...job, applicants: data.totalApplicants };
        }
        return job;
      }));

      setSelectedJobApplicants({
        jobId,
        jobTitle: data.job?.title || 'Unknown Job',
        applicants: data.applicants || [],
        totalApplicants: data.totalApplicants || 0,
      });
    } catch (err) {
      console.error('Failed to load applicants:', err);
      setError(err.message || 'Failed to load applicants');
    } finally {
      setLoadingApplicants(false);
    }
  };

  const handleViewReport = (interviewId) => {
    // Navigate to report page - companies can now view applicant reports
    window.open(`/report/${interviewId}`, '_blank');
  };

  const toggleJobDescription = (jobId) => {
    const newExpanded = new Set(expandedJobs);
    if (newExpanded.has(jobId)) {
      newExpanded.delete(jobId);
    } else {
      newExpanded.add(jobId);
    }
    setExpandedJobs(newExpanded);
  };

  const truncateDescription = (description, maxLength = 150) => {
    if (!description) return '';
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength).trim() + '...';
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Company Dashboard</h1>
          <p className="text-black">Overview of your hiring process</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-black rounded-lg shadow-xl p-6 border border-white">
            <p className="text-white text-sm mb-1">Total Interviews</p>
            <p className="text-3xl font-bold text-white">{stats.totalInterviews}</p>
          </div>
          <div className="bg-black rounded-lg shadow-xl p-6 border border-white">
            <p className="text-white text-sm mb-1">Average Score</p>
            <p className="text-3xl font-bold text-white">{stats.averageScore}%</p>
          </div>
          <div className="bg-black rounded-lg shadow-xl p-6 border border-white">
            <p className="text-white text-sm mb-1">Active Positions</p>
            <p className="text-3xl font-bold text-white">{stats.activePositions}</p>
          </div>
          <div className="bg-black rounded-lg shadow-xl p-6 border border-white">
            <p className="text-white text-sm mb-1">Candidates This Month</p>
            <p className="text-3xl font-bold text-white">{stats.candidatesThisMonth}</p>
          </div>
        </div>

        {/* Job Management Section */}
        <div className="bg-black rounded-lg shadow-xl p-6 border border-white mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Job Descriptions</h2>
            <button
              onClick={() => {
                setShowJobForm(true);
                setEditingJob(null);
                setJobForm({ 
                  title: '', 
                  description: '', 
                  location: '', 
                  level: 'Mid',
                  employmentType: 'Full-time' 
                });
              }}
              className="px-4 py-2 bg-white hover:bg-gray-200 text-black font-medium rounded-md transition-colors"
            >
              Add Job
            </button>
          </div>

          {/* Job Form */}
          {showJobForm && (
            <div className="mb-6 p-4 bg-white rounded-md border border-white">
              <h3 className="text-lg font-semibold text-black mb-4">
                {editingJob ? 'Edit Job' : 'Add New Job'}
              </h3>
              <div className="space-y-4">
                {error && (
                  <div className="p-3 bg-white border border-black rounded-md">
                    <p className="text-black text-sm">{error}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm text-white mb-2">Job Title</label>
                  <input
                    type="text"
                    value={jobForm.title}
                    onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-black rounded-md text-black focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                    placeholder="e.g., Software Engineer"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white mb-2">Description</label>
                  <textarea
                    value={jobForm.description}
                    onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 bg-white border border-black rounded-md text-black focus:outline-none focus:border-black focus:ring-1 focus:ring-black resize-none"
                    placeholder="Job description and requirements"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white mb-2">Location</label>
                  <input
                    type="text"
                    value={jobForm.location}
                    onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-black rounded-md text-black focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                    placeholder="e.g., Remote, New York, NY"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white mb-2">Level</label>
                  <select
                    value={jobForm.level}
                    onChange={(e) => setJobForm({ ...jobForm, level: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-black rounded-md text-black focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                  >
                    <option value="Junior">Junior</option>
                    <option value="Mid">Mid</option>
                    <option value="Senior">Senior</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-white mb-2">Employment Type</label>
                  <select
                    value={jobForm.employmentType}
                    onChange={(e) => setJobForm({ ...jobForm, employmentType: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-black rounded-md text-black focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={editingJob ? handleUpdateJob : handleAddJob}
                    className="px-4 py-2 bg-white hover:bg-gray-200 text-black font-medium rounded-md transition-colors"
                  >
                    {editingJob ? 'Update' : 'Add'} Job
                  </button>
                  <button
                    onClick={() => {
                      setShowJobForm(false);
                      setEditingJob(null);
                      setJobForm({ 
                        title: '', 
                        description: '', 
                        location: '', 
                        level: 'Mid',
                        employmentType: 'Full-time' 
                      });
                      setError('');
                    }}
                    className="px-4 py-2 border border-white hover:border-gray-300 text-white hover:text-gray-300 font-medium rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Jobs List */}
          {loadingJobs ? (
            <div className="text-center py-8">
              <p className="text-white">Loading jobs...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white">No jobs posted yet. Create your first job posting!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => {
                const jobId = job.id || job._id;
                const isExpanded = expandedJobs.has(jobId);
                const description = job.description || '';
                const shouldTruncate = description.length > 150;
                const displayDescription = shouldTruncate && !isExpanded 
                  ? truncateDescription(description, 150)
                  : description;

                return (
                  <div key={jobId} className="p-5 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-black">{job.title}</h3>
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap ${
                            job.status === 'active' ? 'bg-green-100 text-green-800' :
                            job.status === 'closed' ? 'bg-gray-100 text-gray-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {job.status || 'active'}
                          </span>
                        </div>
                        
                        <div className="mb-3">
                          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {displayDescription}
                          </p>
                          {shouldTruncate && (
                            <button
                              onClick={() => toggleJobDescription(jobId)}
                              className="text-sm text-black hover:text-gray-600 font-medium mt-1 underline transition-colors"
                            >
                              {isExpanded ? 'See less' : 'See more'}
                            </button>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 mb-2">
                          <span className="px-2 py-1 bg-gray-100 rounded">{job.level}</span>
                          <span className="px-2 py-1 bg-gray-100 rounded">{job.location || 'Remote'}</span>
                          <span className="px-2 py-1 bg-gray-100 rounded">{job.employmentType}</span>
                          <span className="text-gray-500">
                            {job.applicants || 0} {job.applicants === 1 ? 'applicant' : 'applicants'}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleEditJob(job)}
                          className="px-4 py-2 text-sm border border-gray-300 hover:border-black text-black hover:bg-gray-50 rounded-md transition-colors font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleViewApplicants(jobId)}
                          disabled={loadingApplicants}
                          className="px-4 py-2 text-sm bg-black hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-md transition-colors font-medium"
                        >
                          {loadingApplicants ? 'Loading...' : 'Applicants'}
                        </button>
                        <button
                          onClick={() => handleDeleteJob(jobId)}
                          className="px-4 py-2 text-sm border border-red-300 hover:border-red-600 text-red-600 hover:bg-red-50 rounded-md transition-colors font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Chart Section */}
        <div className="bg-black rounded-lg shadow-xl p-6 border border-white mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Interview Trends</h2>
          <PlaceholderChart />
          <p className="text-xs text-white mt-2">Analytics placeholder - Add real charts here</p>
        </div>

        {/* Common Failure Modes Analytics */}
        <div className="bg-black rounded-lg shadow-xl p-6 border border-white mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Common Failure Modes</h2>
          {loadingAnalytics ? (
            <div className="text-center py-8">
              <p className="text-white">Loading analytics...</p>
            </div>
          ) : commonFailureModes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white">No failure mode data available yet. Analytics will appear as candidates complete interviews.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {commonFailureModes.map((mode, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white font-medium">{mode.mode}</span>
                      <span className="text-white text-sm">{mode.count} instances ({mode.percentage}%)</span>
                    </div>
                    <div className="w-full bg-white rounded-full h-2">
                      <div
                        className="bg-black h-2 rounded-full"
                        style={{ width: `${mode.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Applicants View */}
        {selectedJobApplicants && (
          <div className="bg-black rounded-lg shadow-xl p-6 border border-white mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Applicants for: {selectedJobApplicants.jobTitle}
                </h2>
                <p className="text-white text-sm mt-1">
                  Total: {selectedJobApplicants.totalApplicants} applicant(s)
                </p>
              </div>
              <button
                onClick={() => setSelectedJobApplicants(null)}
                className="px-4 py-2 border border-white hover:border-gray-300 text-white hover:text-gray-300 font-medium rounded-md transition-colors"
              >
                Close
              </button>
            </div>
            {selectedJobApplicants.applicants.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-white">No applicants yet for this job.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white">
                      <th className="text-left text-white font-medium py-3 px-4">Candidate Email</th>
                      <th className="text-left text-white font-medium py-3 px-4">Overall Score</th>
                      <th className="text-left text-white font-medium py-3 px-4">Technical</th>
                      <th className="text-left text-white font-medium py-3 px-4">Behavioral</th>
                      <th className="text-left text-white font-medium py-3 px-4">Completed</th>
                      <th className="text-left text-white font-medium py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedJobApplicants.applicants.map((applicant) => (
                      <tr key={applicant.interviewId} className="border-b border-white">
                        <td className="text-white py-3 px-4">{applicant.candidateEmail}</td>
                        <td className="text-white py-3 px-4">{applicant.overallScore || 'N/A'}%</td>
                        <td className="text-white py-3 px-4">
                          {applicant.technicalScore !== null ? `${applicant.technicalScore}%` : 'N/A'}
                        </td>
                        <td className="text-white py-3 px-4">
                          {applicant.behavioralScore !== null ? `${applicant.behavioralScore}%` : 'N/A'}
                        </td>
                        <td className="text-white py-3 px-4">
                          {applicant.completedAt 
                            ? new Date(applicant.completedAt).toLocaleDateString()
                            : 'N/A'}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleViewReport(applicant.interviewId)}
                            className="text-white hover:text-gray-300 text-sm underline"
                          >
                            View Report
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Recent Candidates (Global view - optional, can be removed if not needed) */}
        <div className="bg-black rounded-lg shadow-xl p-6 border border-white">
          <h2 className="text-xl font-semibold text-white mb-4">All Candidates</h2>
          <p className="text-white text-sm mb-4">
            Click "View Applicants" on any job above to see candidates who applied to that position.
          </p>
        </div>
      </main>
    </div>
  );
}

