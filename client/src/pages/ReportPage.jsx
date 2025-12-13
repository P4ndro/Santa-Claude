import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../authContext';
import { api } from '../api';
import { homePageStyles } from './homePageStyles';

export default function ReportPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id: reportId } = useParams();
  
  const [activeNav, setActiveNav] = useState('reports');
  const [searchInput, setSearchInput] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch reports from API
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        if (reportId) {
          // Fetch specific report
          const reportData = await api.getReport(reportId);
          
          // Transform API data to UI format
          const formattedReport = formatReportForUI(reportData);
          setSelectedReport(formattedReport);
          setReports([formattedReport]);
        } else {
          // Fetch list of all interviews/reports
          const interviewsData = await api.listInterviews();
          const interviews = interviewsData.interviews || [];
          
          // Filter to only completed ones and format for UI
          const formattedReports = interviews
            .filter(i => i.status === 'completed')
            .map((i, index) => formatInterviewListForUI(i, index));
          
          setReports(formattedReports);
          if (formattedReports.length > 0) {
            setSelectedReport(formattedReports[0]);
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to load reports');
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [reportId]);

  // Format single report from API
  function formatReportForUI(data) {
    const report = data.report || {};
    return {
      id: data.interviewId,
      date: data.createdAt ? new Date(data.createdAt).toISOString().split('T')[0] : 'N/A',
      company: data.companyName || 'Practice Interview',
      position: data.jobTitle || 'General',
      level: 'Mid', // Could be extracted from job details
      overallScore: report.overallScore || 0,
      technicalScore: report.technicalScore || null,
      behavioralScore: report.behavioralScore || null,
      readinessBand: report.readinessBand || 'N/A',
      duration: data.completedAt && data.createdAt 
        ? `${Math.round((new Date(data.completedAt) - new Date(data.createdAt)) / 60000)} min`
        : 'N/A',
      status: data.status || 'completed',
      failureModes: (report.primaryBlockers || []).map(b => ({
        mode: b.questionType === 'technical' ? 'Technical Gap' : 'Behavioral Gap',
        issues: b.issue,
        severity: b.severity || 'medium'
      })),
      metrics: {
        answerLength: report.metrics?.averageAnswerLength || 0,
        questionsAnswered: report.metrics?.questionsAnswered || 0,
        questionsSkipped: report.metrics?.questionsSkipped || 0,
        totalQuestions: report.metrics?.totalQuestions || 0
      },
      strengths: report.strengths || ['Participated in interview'],
      recommendations: report.recommendations || ['Keep practicing'],
      primaryBlockers: report.primaryBlockers || []
    };
  }

  // Format interview list item for UI
  function formatInterviewListForUI(interview, index) {
    return {
      id: interview.interviewId,
      date: interview.createdAt ? new Date(interview.createdAt).toISOString().split('T')[0] : 'N/A',
      company: interview.companyName || 'Practice Interview',
      position: interview.jobTitle || 'General',
      level: 'Mid',
      overallScore: interview.overallScore || 0,
      technicalScore: interview.technicalScore || null,
      behavioralScore: interview.behavioralScore || null,
      readinessBand: interview.readinessBand || 'N/A',
      duration: interview.durationMinutes ? `${interview.durationMinutes} min` : 'N/A',
      status: interview.status || 'completed',
      failureModes: [],
      metrics: {
        answerLength: 0,
        questionsAnswered: interview.answersCount || 0,
        questionsSkipped: 0,
        totalQuestions: interview.questionsCount || 0
      },
      strengths: [],
      recommendations: []
    };
  }

  const handleSelectReport = async (report) => {
    // If we don't have full details, fetch them
    if (report.failureModes.length === 0 && report.strengths.length === 0) {
      try {
        const fullReport = await api.getReport(report.id);
        const formatted = formatReportForUI(fullReport);
        setSelectedReport(formatted);
        
        // Update in list too
        setReports(prev => prev.map(r => r.id === report.id ? formatted : r));
      } catch (err) {
        console.error('Failed to load report details:', err);
        setSelectedReport(report);
      }
    } else {
      setSelectedReport(report);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    navigate('/');
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#16a34a';
    if (score >= 65) return '#ca8a04';
    return '#ef4444';
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return { bg: '#fef2f2', border: '#fecaca', text: '#ef4444' };
      case 'medium': return { bg: '#fefce8', border: '#fef08a', text: '#ca8a04' };
      case 'low': return { bg: '#f0fdf4', border: '#bbf7d0', text: '#16a34a' };
      default: return { bg: '#f9fafb', border: '#e5e7eb', text: '#6b7280' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => navigate('/home')}
            className="px-6 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <>
        <style>{homePageStyles}</style>
        <div className="dashboard-container">
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
              <Link to="/home" className="nav-link"><i className="fas fa-th-large"></i><span>Dashboard</span></Link>
              <Link to="/interview" className="nav-link"><i className="fas fa-briefcase"></i><span>Interviews</span></Link>
              <a href="#" className="nav-link active"><i className="fas fa-file-alt"></i><span>Reports</span></a>
            </nav>
            <div className="nav-footer">
              <Link to="/profile" className="nav-link"><i className="fas fa-cog"></i><span>Settings</span></Link>
              <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); handleLogout(); }}>
                <i className="fas fa-sign-out-alt"></i><span>Log out</span>
              </a>
            </div>
          </aside>
          <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <i className="fas fa-file-alt" style={{ fontSize: '48px', color: '#d1d5db', marginBottom: '20px' }}></i>
              <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#111827', marginBottom: '10px' }}>No Reports Yet</h2>
              <p style={{ color: '#6b7280', marginBottom: '20px' }}>Complete an interview to see your report here.</p>
              <button
                onClick={() => navigate('/interview')}
                style={{ 
                  padding: '12px 24px', 
                  background: '#111827', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '25px', 
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Start Practice Interview
              </button>
            </div>
          </main>
        </div>
      </>
    );
  }

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
            <Link to="/home" className="nav-link" onClick={() => setActiveNav('dashboard')}>
              <i className="fas fa-th-large"></i>
              <span>Dashboard</span>
            </Link>
            <Link to="/interview" className="nav-link" onClick={() => setActiveNav('interviews')}>
              <i className="fas fa-briefcase"></i>
              <span>Interviews</span>
            </Link>
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
            <Link to="/profile" className="nav-link" onClick={() => setActiveNav('stats')}>
              <i className="fas fa-chart-bar"></i>
              <span>Stats</span>
            </Link>
          </nav>

          <div className="nav-footer">
            <Link to="/profile" className="nav-link">
              <i className="fas fa-cog"></i>
              <span>Settings</span>
            </Link>
            <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); handleLogout(); }}>
              <i className="fas fa-sign-out-alt"></i>
              <span>Log out</span>
            </a>
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          <div className="top-bar">
            <h1>Interview Reports</h1>
            <div className="search-bar">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Search reports..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <div className="action-icons">
              <div className="action-icon">
                <i className="fas fa-bell"></i>
              </div>
              <div className="action-icon">
                <i className="fas fa-download"></i>
              </div>
            </div>
          </div>

          {/* Reports Grid */}
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '15px' }}>
              All Reports ({reports.length})
            </h2>
            <div className="widget-grid">
              {reports
                .filter(r => 
                  r.company.toLowerCase().includes(searchInput.toLowerCase()) ||
                  r.position.toLowerCase().includes(searchInput.toLowerCase())
                )
                .map((report) => (
                <div
                  key={report.id}
                  className="widget-card"
                  onClick={() => handleSelectReport(report)}
                  style={{ 
                    cursor: 'pointer',
                    border: selectedReport?.id === report.id ? '2px solid #111827' : '1px solid #e5e7eb'
                  }}
                >
                  {report.id === reports[0]?.id && (
                    <span className="widget-badge">Latest</span>
                  )}
                  <div className="widget-header">
                    <div className="widget-icon" style={{ background: getScoreColor(report.overallScore) }}>
                      <span style={{ fontSize: '16px', fontWeight: '700' }}>{report.overallScore}%</span>
                    </div>
                    <div className="widget-info">
                      <h3>{report.position}</h3>
                      <p>{report.company}</p>
                    </div>
                  </div>
                  <div className="widget-details">
                    <div style={{ display: 'flex', gap: '15px', fontSize: '13px', color: '#6b7280' }}>
                      <span><i className="fas fa-calendar"></i> {report.date}</span>
                      <span><i className="fas fa-clock"></i> {report.duration}</span>
                    </div>
                    <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                      <span style={{
                        padding: '3px 10px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '600',
                        background: '#f3f4f6',
                        color: '#6b7280'
                      }}>
                        {report.readinessBand}
                      </span>
                      <span style={{
                        padding: '3px 10px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '600',
                        background: report.overallScore >= 75 ? '#dcfce7' : '#fef3c7',
                        color: report.overallScore >= 75 ? '#16a34a' : '#ca8a04'
                      }}>
                        {report.overallScore >= 75 ? 'Passed' : 'Needs Work'}
                      </span>
                    </div>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-info">
                      <span>Performance</span>
                      <span>{report.overallScore}%</span>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ 
                        width: `${report.overallScore}%`,
                        background: getScoreColor(report.overallScore)
                      }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Report Details */}
          {selectedReport && (
            <div className="calendar-section">
              <div className="calendar-header">
                <h2>Report Details - {selectedReport.position} at {selectedReport.company}</h2>
                <div className="calendar-toggle">
                  <i className="fas fa-download"></i> Export PDF
                </div>
              </div>

              {/* Metrics Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '25px' }}>
                <div style={{ background: '#f9fafb', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: getScoreColor(selectedReport.overallScore) }}>
                    {selectedReport.overallScore}%
                  </div>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>Overall Score</div>
                </div>
                {selectedReport.technicalScore !== null && (
                  <div style={{ background: '#f9fafb', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: getScoreColor(selectedReport.technicalScore) }}>
                      {selectedReport.technicalScore}%
                    </div>
                    <div style={{ fontSize: '13px', color: '#6b7280' }}>Technical</div>
                  </div>
                )}
                {selectedReport.behavioralScore !== null && (
                  <div style={{ background: '#f9fafb', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: getScoreColor(selectedReport.behavioralScore) }}>
                      {selectedReport.behavioralScore}%
                    </div>
                    <div style={{ fontSize: '13px', color: '#6b7280' }}>Behavioral</div>
                  </div>
                )}
                <div style={{ background: '#f9fafb', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: '#111827' }}>
                    {selectedReport.metrics.questionsAnswered}/{selectedReport.metrics.totalQuestions}
                  </div>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>Answered</div>
                </div>
              </div>

              {/* Primary Blockers */}
              {selectedReport.primaryBlockers && selectedReport.primaryBlockers.length > 0 && (
                <>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '15px' }}>
                    <i className="fas fa-exclamation-triangle" style={{ marginRight: '8px', color: '#ca8a04' }}></i>
                    Primary Blockers
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '25px' }}>
                    {selectedReport.primaryBlockers.map((blocker, index) => {
                      const colors = getSeverityColor(blocker.severity);
                      return (
                        <div
                          key={index}
                          style={{
                            padding: '15px 20px',
                            background: colors.bg,
                            border: `1px solid ${colors.border}`,
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}
                        >
                          <div>
                            <h4 style={{ fontWeight: '600', color: '#111827', marginBottom: '3px' }}>
                              {blocker.questionText?.substring(0, 60)}...
                            </h4>
                            <p style={{ fontSize: '13px', color: '#6b7280' }}>
                              {blocker.issue}
                            </p>
                          </div>
                          <span style={{
                            padding: '5px 12px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            background: 'white',
                            color: colors.text
                          }}>
                            {blocker.severity}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Strengths & Recommendations */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ background: '#f0fdf4', padding: '20px', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#16a34a', marginBottom: '15px' }}>
                    <i className="fas fa-check-circle" style={{ marginRight: '8px' }}></i>
                    Strengths
                  </h3>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {selectedReport.strengths.map((strength, index) => (
                      <li key={index} style={{ 
                        display: 'flex', 
                        alignItems: 'flex-start', 
                        gap: '10px',
                        marginBottom: '10px',
                        color: '#166534',
                        fontSize: '14px'
                      }}>
                        <span style={{ color: '#16a34a' }}>✓</span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>

                <div style={{ background: '#eff6ff', padding: '20px', borderRadius: '10px', border: '1px solid #bfdbfe' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#2563eb', marginBottom: '15px' }}>
                    <i className="fas fa-lightbulb" style={{ marginRight: '8px' }}></i>
                    Recommendations
                  </h3>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {selectedReport.recommendations.map((rec, index) => (
                      <li key={index} style={{ 
                        display: 'flex', 
                        alignItems: 'flex-start', 
                        gap: '10px',
                        marginBottom: '10px',
                        color: '#1e40af',
                        fontSize: '14px'
                      }}>
                        <span style={{ color: '#2563eb' }}>•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Right Sidebar */}
        <aside className="sidebar-right">
          {/* Overall Stats */}
          <div className="sidebar-section">
            <h3>Performance Overview</h3>
            <div className="video-preview" style={{ 
              background: 'linear-gradient(135deg, #111827, #374151)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexDirection: 'column'
            }}>
              <div style={{ fontSize: '42px', fontWeight: '700', color: 'white' }}>
                {reports.length > 0 
                  ? Math.round(reports.reduce((acc, r) => acc + r.overallScore, 0) / reports.length)
                  : 0}%
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>Average Score</div>
            </div>
            <div className="interview-info">
              <h4>Your Statistics</h4>
              <div className="interview-details">
                <div className="detail-row">
                  <span>Total Interviews:</span>
                  <span>{reports.length}</span>
                </div>
                <div className="detail-row">
                  <span>Best Score:</span>
                  <span className="status-active">
                    {reports.length > 0 ? Math.max(...reports.map(r => r.overallScore)) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="sidebar-section">
            <h3>Actions</h3>
            <div className="notification-card" style={{ cursor: 'pointer', marginBottom: '10px' }} onClick={() => navigate('/interview')}>
              <div className="notification-content">
                <h4>Practice Again</h4>
                <p>Start a new interview</p>
              </div>
              <div className="notification-action">
                <i className="fas fa-play"></i>
              </div>
            </div>
            <div className="notification-card" style={{ cursor: 'pointer', marginBottom: '10px' }} onClick={() => navigate('/home')}>
              <div className="notification-content">
                <h4>Back to Dashboard</h4>
                <p>View available jobs</p>
              </div>
              <div className="notification-action">
                <i className="fas fa-home"></i>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
