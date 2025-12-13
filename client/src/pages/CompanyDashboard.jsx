import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../authContext';
import { homePageStyles } from './homePageStyles';

export default function CompanyDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const companyName = localStorage.getItem('companyName') || 'Your Company';
  const [searchInput, setSearchInput] = useState('');
  const [activeNav, setActiveNav] = useState('dashboard');

  // Job management state
  const [jobs, setJobs] = useState([
    { id: 1, title: 'Software Engineer', description: 'Full-stack developer needed', applicants: 12, status: 'Active' },
    { id: 2, title: 'Frontend Developer', description: 'React/TypeScript expert', applicants: 8, status: 'Active' },
    { id: 3, title: 'Backend Engineer', description: 'Node.js/Python developer', applicants: 15, status: 'Paused' },
  ]);

  const [editingJob, setEditingJob] = useState(null);
  const [showJobForm, setShowJobForm] = useState(false);
  const [jobForm, setJobForm] = useState({ title: '', description: '' });

  // Stats
  const stats = {
    totalInterviews: 124,
    averageScore: 78,
    activePositions: jobs.filter(j => j.status === 'Active').length,
    candidatesThisMonth: 45,
  };

  // Recent candidates
  const recentCandidates = [
    { id: 1, name: 'John Doe', position: 'Software Engineer', score: 85, date: '2024-01-15' },
    { id: 2, name: 'Jane Smith', position: 'Frontend Developer', score: 92, date: '2024-01-14' },
    { id: 3, name: 'Bob Johnson', position: 'Backend Engineer', score: 76, date: '2024-01-13' },
  ];

  // Failure modes
  const failureModes = [
    { mode: 'Filler Words', percentage: 36 },
    { mode: 'Answer Length', percentage: 26 },
    { mode: 'Structure Issues', percentage: 23 },
  ];

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('companyName');
    navigate('/');
  };

  const handleAddJob = () => {
    const newJob = {
      id: jobs.length + 1,
      title: jobForm.title,
      description: jobForm.description,
      applicants: 0,
      status: 'Active',
    };
    setJobs([...jobs, newJob]);
    setJobForm({ title: '', description: '' });
    setShowJobForm(false);
  };

  const handleEditJob = (job) => {
    setEditingJob(job);
    setJobForm({ title: job.title, description: job.description });
    setShowJobForm(true);
  };

  const handleUpdateJob = () => {
    setJobs(jobs.map(job => 
      job.id === editingJob.id 
        ? { ...job, title: jobForm.title, description: jobForm.description }
        : job
    ));
    setEditingJob(null);
    setJobForm({ title: '', description: '' });
    setShowJobForm(false);
  };

  const handleDeleteJob = (jobId) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      setJobs(jobs.filter(job => job.id !== jobId));
    }
  };

  return (
    <>
      <style>{homePageStyles}</style>
      <div className="dashboard-container">
        {/* Left Sidebar */}
        <aside className="sidebar-left">
          <div className="profile-header">
            <div className="profile-avatar">
              <i className="fas fa-building"></i>
            </div>
            <div className="profile-info">
              <h3>{companyName}</h3>
              <p>{user?.email || 'company@example.com'}</p>
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
              className={`nav-link ${activeNav === 'jobs' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                setActiveNav('jobs');
              }}
            >
              <i className="fas fa-briefcase"></i>
              <span>Job Positions</span>
            </a>
            <a
              href="#"
              className={`nav-link ${activeNav === 'candidates' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                setActiveNav('candidates');
              }}
            >
              <i className="fas fa-users"></i>
              <span>Candidates</span>
            </a>
            <a
              href="#"
              className={`nav-link ${activeNav === 'analytics' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                setActiveNav('analytics');
              }}
            >
              <i className="fas fa-chart-bar"></i>
              <span>Analytics</span>
            </a>
            <a
              href="#"
              className={`nav-link ${activeNav === 'reports' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                setActiveNav('reports');
              }}
            >
              <i className="fas fa-file-alt"></i>
              <span>Reports</span>
            </a>
          </nav>

          <div className="nav-footer">
            <a href="#" className="nav-link" onClick={(e) => {
              e.preventDefault();
              setActiveNav('settings');
            }}>
              <i className="fas fa-cog"></i>
              <span>Settings</span>
            </a>
            <a href="#" className="nav-link" onClick={(e) => {
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
            <h1>Company Dashboard</h1>
            <div className="search-bar">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Search candidates, jobs..."
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

          {/* Stats Widget Grid */}
          <div className="widget-grid">
            {/* Card 1: Total Interviews */}
            <div className="widget-card">
              <div className="widget-header">
                <div className="widget-icon">
                  <i className="fas fa-video"></i>
                </div>
                <div className="widget-info">
                  <h3>Total Interviews</h3>
                  <p>All time conducted</p>
                </div>
              </div>
              <div className="widget-details">
                <div style={{ fontSize: '36px', fontWeight: '700', color: '#111827' }}>{stats.totalInterviews}</div>
                <div className="widget-stats">
                  <span><i className="fas fa-arrow-up" style={{ color: '#27ae60' }}></i> 12% from last month</span>
                </div>
              </div>
            </div>

            {/* Card 2: Average Score */}
            <div className="widget-card">
              <span className="widget-badge">Performance</span>
              <div className="widget-header">
                <div className="widget-icon">
                  <i className="fas fa-chart-line"></i>
                </div>
                <div className="widget-info">
                  <h3>Average Score</h3>
                  <p>Candidate performance</p>
                </div>
              </div>
              <div className="widget-details">
                <div style={{ fontSize: '36px', fontWeight: '700', color: '#111827' }}>{stats.averageScore}%</div>
              </div>
              <div className="progress-bar">
                <div className="progress-info">
                  <span>Overall Rating</span>
                  <span>{stats.averageScore}%</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${stats.averageScore}%` }}></div>
                </div>
              </div>
            </div>

            {/* Card 3: Active Positions */}
            <div className="widget-card">
              <div className="widget-header">
                <div className="widget-icon">
                  <i className="fas fa-briefcase"></i>
                </div>
                <div className="widget-info">
                  <h3>Active Positions</h3>
                  <p>Currently hiring</p>
                </div>
              </div>
              <div className="widget-details">
                <div style={{ fontSize: '36px', fontWeight: '700', color: '#111827' }}>{stats.activePositions}</div>
                <div className="widget-stats">
                  <span><i className="fas fa-clock"></i> 2 closing soon</span>
                </div>
              </div>
            </div>

            {/* Card 4: Candidates This Month */}
            <div className="widget-card">
              <span className="widget-badge">New</span>
              <div className="widget-header">
                <div className="widget-icon">
                  <i className="fas fa-user-plus"></i>
                </div>
                <div className="widget-info">
                  <h3>New Candidates</h3>
                  <p>This month</p>
                </div>
              </div>
              <div className="widget-details">
                <div style={{ fontSize: '36px', fontWeight: '700', color: '#111827' }}>{stats.candidatesThisMonth}</div>
                <div className="widget-stats">
                  <span><i className="fas fa-arrow-up" style={{ color: '#27ae60' }}></i> 23% increase</span>
                </div>
              </div>
            </div>
          </div>

          {/* Job Positions Section */}
          <div className="calendar-section" style={{ marginBottom: '20px' }}>
            <div className="calendar-header">
              <h2>Job Positions</h2>
              <button 
                onClick={() => {
                  setShowJobForm(true);
                  setEditingJob(null);
                  setJobForm({ title: '', description: '' });
                }}
                style={{
                  padding: '10px 20px',
                  background: '#111827',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                <i className="fas fa-plus"></i> Add Job
              </button>
            </div>

            {/* Job Form */}
            {showJobForm && (
              <div style={{
                background: '#f9fafb',
                borderRadius: '10px',
                padding: '20px',
                marginBottom: '20px',
                border: '1px solid #e5e7eb'
              }}>
                <h3 style={{ marginBottom: '15px', color: '#111827' }}>
                  {editingJob ? 'Edit Job' : 'Add New Job'}
                </h3>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#6b7280' }}>Job Title</label>
                  <input
                    type="text"
                    value={jobForm.title}
                    onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                    placeholder="e.g., Software Engineer"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#6b7280' }}>Description</label>
                  <textarea
                    value={jobForm.description}
                    onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                    placeholder="Job description and requirements"
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      resize: 'none'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={editingJob ? handleUpdateJob : handleAddJob}
                    style={{
                      padding: '10px 20px',
                      background: '#111827',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    {editingJob ? 'Update' : 'Add'} Job
                  </button>
                  <button
                    onClick={() => {
                      setShowJobForm(false);
                      setEditingJob(null);
                      setJobForm({ title: '', description: '' });
                    }}
                    style={{
                      padding: '10px 20px',
                      background: 'transparent',
                      color: '#6b7280',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Jobs List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {jobs.map((job) => (
                <div 
                  key={job.id} 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '15px 20px',
                    background: '#f9fafb',
                    borderRadius: '10px',
                    border: '1px solid #e5e7eb',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                      <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>{job.title}</h4>
                      <span style={{
                        padding: '3px 10px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '600',
                        background: job.status === 'Active' ? '#dcfce7' : '#f3f4f6',
                        color: job.status === 'Active' ? '#16a34a' : '#6b7280'
                      }}>
                        {job.status}
                      </span>
                    </div>
                    <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '5px' }}>{job.description}</p>
                    <p style={{ fontSize: '12px', color: '#9ca3af' }}>{job.applicants} applicants</p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleEditJob(job)}
                      style={{
                        padding: '8px 15px',
                        background: 'transparent',
                        color: '#6b7280',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        fontSize: '13px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteJob(job.id)}
                      style={{
                        padding: '8px 15px',
                        background: 'transparent',
                        color: '#ef4444',
                        border: '1px solid #fecaca',
                        borderRadius: '6px',
                        fontSize: '13px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Candidates Table */}
          <div className="calendar-section">
            <div className="calendar-header">
              <h2>Recent Candidates</h2>
              <div className="calendar-toggle">
                <i className="fas fa-filter"></i> Filter
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ textAlign: 'left', padding: '12px', fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Candidate</th>
                    <th style={{ textAlign: 'left', padding: '12px', fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Position</th>
                    <th style={{ textAlign: 'left', padding: '12px', fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Score</th>
                    <th style={{ textAlign: 'left', padding: '12px', fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Date</th>
                    <th style={{ textAlign: 'left', padding: '12px', fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentCandidates.map((candidate) => (
                    <tr key={candidate.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '15px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '35px',
                            height: '35px',
                            borderRadius: '50%',
                            background: '#111827',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                            fontWeight: '600'
                          }}>
                            {candidate.name.charAt(0)}
                          </div>
                          <span style={{ fontWeight: '500', color: '#111827' }}>{candidate.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '15px 12px', color: '#6b7280' }}>{candidate.position}</td>
                      <td style={{ padding: '15px 12px' }}>
                        <span style={{
                          fontWeight: '600',
                          color: candidate.score >= 85 ? '#16a34a' : candidate.score >= 70 ? '#ca8a04' : '#ef4444'
                        }}>
                          {candidate.score}%
                        </span>
                      </td>
                      <td style={{ padding: '15px 12px', color: '#9ca3af', fontSize: '13px' }}>{candidate.date}</td>
                      <td style={{ padding: '15px 12px' }}>
                        <button
                          onClick={() => navigate(`/report/${candidate.id}`)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#111827',
                            fontWeight: '500',
                            cursor: 'pointer',
                            textDecoration: 'underline'
                          }}
                        >
                          View Report
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="sidebar-right">
          {/* Quick Stats */}
          <div className="sidebar-section">
            <h3>Quick Overview</h3>
            <div className="video-preview" style={{ background: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center', color: 'white' }}>
                <div style={{ fontSize: '32px', fontWeight: '700' }}>{stats.totalInterviews}</div>
                <div style={{ fontSize: '12px', opacity: 0.7 }}>Total Interviews</div>
              </div>
            </div>
            <div className="interview-info">
              <h4>This Week's Activity</h4>
              <div className="interview-details">
                <div className="detail-row">
                  <span>New Applications:</span>
                  <span>24</span>
                </div>
                <div className="detail-row">
                  <span>Interviews Scheduled:</span>
                  <span>8</span>
                </div>
                <div className="detail-row">
                  <span>Offers Extended:</span>
                  <span className="status-active">3</span>
                </div>
              </div>
            </div>
          </div>

          {/* Common Failure Modes */}
          <div className="sidebar-section">
            <h3>Common Failure Modes</h3>
            <div className="performance-list">
              {failureModes.map((mode, index) => (
                <div key={index} className="performance-item">
                  <div className="performance-icon">
                    <i className={`fas ${
                      mode.mode === 'Filler Words' ? 'fa-comment' :
                      mode.mode === 'Answer Length' ? 'fa-align-left' : 'fa-sitemap'
                    }`}></i>
                  </div>
                  <div className="performance-info">
                    <h4>{mode.mode}</h4>
                    <div style={{
                      width: '100%',
                      height: '4px',
                      background: '#f3f4f6',
                      borderRadius: '2px',
                      marginTop: '5px'
                    }}>
                      <div style={{
                        width: `${mode.percentage}%`,
                        height: '100%',
                        background: '#111827',
                        borderRadius: '2px'
                      }}></div>
                    </div>
                  </div>
                  <div className="performance-badge">{mode.percentage}%</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="sidebar-section">
            <h3>Quick Actions</h3>
            <div className="notification-card" style={{ cursor: 'pointer', marginBottom: '10px' }} onClick={() => setShowJobForm(true)}>
              <div className="notification-content">
                <h4>Create New Position</h4>
                <p>Post a new job opening</p>
              </div>
              <div className="notification-action">
                <i className="fas fa-plus"></i>
              </div>
            </div>
            <div className="notification-card" style={{ cursor: 'pointer', marginBottom: '10px' }}>
              <div className="notification-content">
                <h4>Export Reports</h4>
                <p>Download candidate data</p>
              </div>
              <div className="notification-action">
                <i className="fas fa-download"></i>
              </div>
            </div>
            <div className="notification-card" style={{ cursor: 'pointer' }}>
              <div className="notification-content">
                <h4>View Analytics</h4>
                <p>Detailed hiring insights</p>
              </div>
              <div className="notification-action">
                <i className="fas fa-chart-pie"></i>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
