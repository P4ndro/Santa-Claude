import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../authContext';
import Navbar from '../components/Navbar';
import JobCard from '../components/JobCard';
import { homePageStyles } from './homePageStyles';
import { api } from '../api';

export default function HomePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userRole] = useState(localStorage.getItem('userRole') || 'candidate');
  const [searchInput, setSearchInput] = useState('');
  const [activeNav, setActiveNav] = useState('dashboard');
  
  // API state
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [stats, setStats] = useState(null);
  const [startingInterview, setStartingInterview] = useState(false);
  const [error, setError] = useState('');

  // Fetch jobs and stats from API
  useEffect(() => {
    async function fetchData() {
      try {
        const [jobsData, statsData] = await Promise.all([
          api.listJobs(),
          api.getMyStats(),
        ]);
        setJobs(jobsData.jobs || []);
        setStats(statsData);
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setLoadingJobs(false);
      }
    }
    
    if (userRole === 'candidate') {
      fetchData();
    } else {
      setLoadingJobs(false);
    }
  }, [userRole]);

  const handleStartPractice = async () => {
    try {
      setStartingInterview(true);
      setError('');
      const data = await api.startInterview();
      if (data && data.interviewId) {
        navigate(`/interview/${data.interviewId}`);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Failed to start interview:', err);
      setError(err.message || 'Failed to start interview. Please try again.');
      setStartingInterview(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem('userRole');
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Candidate View - Dashboard
  if (userRole === 'candidate') {
    return (
      <>
        <style>{homePageStyles}</style>
        <div className="dashboard-container">
          {/* Left Sidebar */}
          <aside className="sidebar-left">
            <div className="profile-header">
              <div className="profile-avatar">
                <i className="fas fa-user"></i>
              </div>
              <div className="profile-info">
                <h3>InterviewSim</h3>
                <p>{user?.email || 'user@example.com'}</p>
              </div>
            </div>

            <nav className="nav-links">
              <a
                href="#"
                className={`nav-link ${activeNav === 'dashboard' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveNav('dashboard');
                }}
              >
                <i className="fas fa-th-large"></i>
                <span>Dashboard</span>
              </a>
              <a
                href="#"
                className={`nav-link ${activeNav === 'interviews' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveNav('interviews');
                  handleStartPractice();
                }}
              >
                <i className="fas fa-briefcase"></i>
                <span>{startingInterview ? 'Starting...' : 'Start Interview'}</span>
              </a>
              <a
                href=""
                className={`nav-link ${activeNav === 'feedback' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveNav('feedback');
                }}
              >
                <i className="fas fa-comment-dots"></i>
                <span>Feedback</span>
              </a>
              <Link
                to="/profile"
                className={`nav-link ${activeNav === 'stats' ? 'active' : ''}`}
                onClick={(e) => {
                  setActiveNav('stats');
                }}
              >
                <i className="fas fa-chart-bar"></i>
                <span>Stats</span>
              </Link>
              <a
                href="#"
                className={`nav-link ${activeNav === 'notes' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveNav('notes');
                }}
              >
                <i className="fas fa-sticky-note"></i>
                <span>Notes</span>
              </a>
            </nav>

            <div className="nav-footer">
              <Link to="/profile" className="nav-link" onClick={(e) => {
                setActiveNav('settings');
              }}>
                <i className="fas fa-cog"></i>
                <span>Settings</span>
              </Link>
              <a href="." className="nav-link" onClick={(e) => {
                e.preventDefault();
                handleLogout();
              }}>
                <i className="fas fa-sign-out-alt"></i>
                <span>Log out</span>
              </a>
            </div>
          </aside>

          {/* Main Content */}
          <main className="main-content">
            <div className="top-bar">
              <h1>Dashboard</h1>
              <div className="search-bar">
                <i className="fas fa-search"></i>
                <input
                  type="text"
                  placeholder="Search interviews..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
              <div className="action-icons">
                <div className="action-icon">
                  <i className="fas fa-bell"></i>
                </div>
                <div className="action-icon">
                  <i className="fas fa-envelope"></i>
                </div>
                <div className="action-icon">
                  <i className="fas fa-question-circle"></i>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="notification-card" style={{ marginBottom: '20px', background: '#fef2f2', border: '1px solid #fecaca' }}>
                <div className="notification-content" style={{ color: '#dc2626' }}>
                  <h4><i className="fas fa-exclamation-circle" style={{ marginRight: '8px' }}></i>{error}</h4>
                </div>
                <div className="notification-action" onClick={() => setError('')} style={{ cursor: 'pointer', color: '#dc2626' }}>
                  <i className="fas fa-times"></i>
                </div>
              </div>
            )}

            {/* Widget Grid */}
            <div className="widget-grid">
              {/* Card 1: AI Recruiter */}
              <div className="widget-card">
                <span className="widget-badge">Practice</span>
                <div className="widget-header">
                  <div className="widget-icon">
                    <i className="fas fa-robot"></i>
                  </div>
                  <div className="widget-info">
                    <h3>AI Recruiter</h3>
                    <p>Simulate your interview!</p>
                  </div>
                </div>
                <div className="progress-bar" style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #e5e7eb' }}>
                  <button
                    onClick={handleStartPractice}
                    disabled={startingInterview}
                    className="status-active"
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: startingInterview ? '#9ca3af' : '#111827',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: startingInterview ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {startingInterview ? 'Starting...' : 'Start Practice Interview'}
                  </button>
                </div>
              </div>

              {/* Card 2: Performance */}
              <div className="widget-card">
                <span className="widget-badge">Results</span>
                <div className="widget-header">
                  <div className="widget-icon">
                    <i className="fas fa-chart-line"></i>
                  </div>
                  <div className="widget-info">
                    <h3>Performance</h3>
                    <p>Track your progress</p>
                  </div>
                </div>
                <div className="progress-bar" style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #e5e7eb' }}>
                  <Link 
                    to="/report" 
                    className="status-active"
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '10px',
                      background: '#f3f4f6',
                      color: '#111827',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontWeight: '600',
                      textAlign: 'center',
                      textDecoration: 'none'
                    }}
                  >
                    View Reports
                  </Link>
                </div>
              </div>
            </div>

            {/* Jobs Section */}
            <div className="calendar-section" style={{ marginTop: '30px' }}>
              <div className="calendar-header">
                <h2>Available Jobs</h2>
                <div className="calendar-toggle">
                  <i className="fas fa-briefcase"></i> {jobs.length} Jobs
                </div>
              </div>
              
              {loadingJobs ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                  <i className="fas fa-spinner fa-spin" style={{ fontSize: '24px', marginBottom: '10px' }}></i>
                  <p>Loading jobs...</p>
                </div>
              ) : jobs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                  <i className="fas fa-briefcase" style={{ fontSize: '48px', marginBottom: '15px', opacity: 0.3 }}></i>
                  <p>No jobs available at the moment</p>
                </div>
              ) : (
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                  gap: '20px',
                  marginTop: '20px'
                }}>
                  {jobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              )}
            </div>

            {/* Calendar Section */}
            <div className="calendar-section">
              <div className="calendar-header">
                <h2>Your Schedule</h2>
                <div className="calendar-toggle">
                  <i className="fas fa-calendar-alt"></i> Ongoing Sessions
                </div>
              </div>
              <div className="calendar-grid">
                <div className="calendar-day-header">Mon</div>
                <div className="calendar-day-header">Tue</div>
                <div className="calendar-day-header">Wed</div>
                <div className="calendar-day-header">Thu</div>
                <div className="calendar-day-header">Fri</div>
                <div className="calendar-day-header">Sat</div>
                <div className="calendar-day-header">Sun</div>

                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30].map((day) => (
                  <div
                    key={day}
                    className={`calendar-day ${
                      [4, 10, 15].includes(day) ? 'has-event' : ''
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>
            </div>
          </main>

          {/* Right Sidebar */}
          <aside className="sidebar-right">
            {/* Performance Summary */}
            <div className="sidebar-section">
              <h3>Performance Summary</h3>
              <div className="performance-list">
                <div className="performance-item">
                  <div className="performance-icon">
                    <i className="fas fa-microphone"></i>
                  </div>
                  <div className="performance-info">
                    <h4>Completed Interviews</h4>
                    <p>Total</p>
                  </div>
                  <div className="performance-badge">{stats?.completedInterviews || 0}</div>
                </div>
                <div className="performance-item">
                  <div className="performance-icon">
                    <i className="fas fa-chart-line"></i>
                  </div>
                  <div className="performance-info">
                    <h4>Average Score</h4>
                    <p>All Interviews</p>
                  </div>
                  <div className="performance-badge">{stats?.averageScore ? `${stats.averageScore}%` : 'N/A'}</div>
                </div>
                <div className="performance-item">
                  <div className="performance-icon">
                    <i className="fas fa-clock"></i>
                  </div>
                  <div className="performance-info">
                    <h4>Practice Time</h4>
                    <p>Total</p>
                  </div>
                  <div className="performance-badge">{stats?.totalPracticeTime || '0m'}</div>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="sidebar-section">
              <h3>Notifications</h3>
              <div className="notification-card">
                <div className="notification-content">
                  <h4>Your interview feedback is ready!</h4>
                  <p>For assistance, please contact our support team.</p>
                </div>
                <div className="notification-action">
                  <i className="fas fa-arrow-right"></i>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </>
    );
  }

  // Organization View
  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Organization Dashboard
          </h1>
          <p className="text-slate-400">Manage your hiring process</p>
        </div>

        <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700 mb-6">
          <p className="text-slate-300 mb-4">
            Access your company dashboard to manage jobs, view applicants, and analyze interview reports.
          </p>
          <Link
            to="/company-dashboard"
            className="inline-block px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors"
          >
            Go to Company Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}


