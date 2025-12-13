import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../authContext';
import { homePageStyles } from './homePageStyles';

export default function ReportPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState('reports');
  const [searchInput, setSearchInput] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);

  // Mock reports data - all generated reports
  const [reports, setReports] = useState([
    {
      id: 1,
      date: '2024-01-15',
      company: 'TechCorp',
      position: 'Software Engineer',
      level: 'Senior',
      overallScore: 85,
      duration: '45 min',
      status: 'completed',
      failureModes: [
        { mode: 'Filler Words', count: 12, severity: 'medium' },
        { mode: 'Answer Length', issues: 'Good detail', severity: 'low' },
        { mode: 'Structure', issues: 'Well organized', severity: 'low' },
      ],
      metrics: { answerLength: 180, fillerWords: 12, pauses: 8, structureScore: 8.5 },
      strengths: ['Strong technical knowledge', 'Clear communication', 'Good examples'],
      recommendations: ['Reduce filler words slightly', 'More eye contact'],
    },
    {
      id: 2,
      date: '2024-01-12',
      company: 'InnovDesigns',
      position: 'Frontend Developer',
      level: 'Mid',
      overallScore: 72,
      duration: '38 min',
      status: 'completed',
      failureModes: [
        { mode: 'Filler Words', count: 28, severity: 'high' },
        { mode: 'Answer Length', issues: 'Too short', severity: 'medium' },
        { mode: 'Pause Frequency', count: 18, severity: 'high' },
      ],
      metrics: { answerLength: 120, fillerWords: 28, pauses: 18, structureScore: 6.0 },
      strengths: ['Good problem-solving', 'Technical accuracy'],
      recommendations: ['Practice speaking fluently', 'Provide longer answers', 'Use STAR method'],
    },
    {
      id: 3,
      date: '2024-01-08',
      company: 'MedGen',
      position: 'Data Scientist',
      level: 'Junior',
      overallScore: 68,
      duration: '42 min',
      status: 'completed',
      failureModes: [
        { mode: 'Filler Words', count: 35, severity: 'high' },
        { mode: 'Eye Contact', issues: 'Looking away frequently', severity: 'high' },
        { mode: 'Structure', issues: 'Lacks organization', severity: 'medium' },
      ],
      metrics: { answerLength: 95, fillerWords: 35, pauses: 22, structureScore: 5.0 },
      strengths: ['Enthusiasm', 'Willingness to learn'],
      recommendations: ['Practice more mock interviews', 'Work on confidence', 'Structure answers better'],
    },
  ]);

  // Check if coming from an interview - generate new report
  useEffect(() => {
    const interviewSetup = sessionStorage.getItem('interviewSetup');
    if (interviewSetup) {
      const setup = JSON.parse(interviewSetup);
      // Generate a new report based on the interview
      const newReport = {
        id: reports.length + 1,
        date: new Date().toISOString().split('T')[0],
        company: setup.company || 'Practice Interview',
        position: setup.role || 'General',
        level: setup.level || 'Mid',
        overallScore: Math.floor(Math.random() * 30) + 65, // Random score 65-95
        duration: `${setup.duration || 45} min`,
        status: 'completed',
        failureModes: [
          { mode: 'Filler Words', count: Math.floor(Math.random() * 30) + 5, severity: Math.random() > 0.5 ? 'high' : 'medium' },
          { mode: 'Answer Length', issues: Math.random() > 0.5 ? 'Good detail' : 'Could be longer', severity: Math.random() > 0.5 ? 'low' : 'medium' },
          { mode: 'Structure', issues: Math.random() > 0.5 ? 'Well organized' : 'Needs improvement', severity: Math.random() > 0.5 ? 'low' : 'medium' },
        ],
        metrics: {
          answerLength: Math.floor(Math.random() * 100) + 100,
          fillerWords: Math.floor(Math.random() * 30) + 5,
          pauses: Math.floor(Math.random() * 20) + 5,
          structureScore: (Math.random() * 4 + 5).toFixed(1),
        },
        strengths: ['Technical knowledge demonstrated', 'Clear communication', 'Good engagement'],
        recommendations: ['Continue practicing', 'Work on areas identified', 'Review failure modes'],
      };
      
      setReports(prev => [newReport, ...prev]);
      setSelectedReport(newReport);
      sessionStorage.removeItem('interviewSetup');
    } else {
      // Select the most recent report by default
      if (reports.length > 0) {
        setSelectedReport(reports[0]);
      }
    }
  }, []);

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
                  onClick={() => setSelectedReport(report)}
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
                        {report.level}
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
                <div style={{ background: '#f9fafb', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: '#111827' }}>
                    {selectedReport.metrics.answerLength}
                  </div>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>Avg. Words/Answer</div>
                </div>
                <div style={{ background: '#f9fafb', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: selectedReport.metrics.fillerWords > 20 ? '#ef4444' : '#111827' }}>
                    {selectedReport.metrics.fillerWords}
                  </div>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>Filler Words</div>
                </div>
                <div style={{ background: '#f9fafb', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: '#111827' }}>
                    {selectedReport.metrics.structureScore}/10
                  </div>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>Structure Score</div>
                </div>
              </div>

              {/* Failure Modes */}
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '15px' }}>
                <i className="fas fa-exclamation-triangle" style={{ marginRight: '8px', color: '#ca8a04' }}></i>
                Failure Modes Detected
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '25px' }}>
                {selectedReport.failureModes.map((mode, index) => {
                  const colors = getSeverityColor(mode.severity);
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
                        <h4 style={{ fontWeight: '600', color: '#111827', marginBottom: '3px' }}>{mode.mode}</h4>
                        <p style={{ fontSize: '13px', color: '#6b7280' }}>
                          {mode.count ? `Count: ${mode.count}` : mode.issues}
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
                        {mode.severity}
                      </span>
                    </div>
                  );
                })}
              </div>

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
                {Math.round(reports.reduce((acc, r) => acc + r.overallScore, 0) / reports.length)}%
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
                  <span className="status-active">{Math.max(...reports.map(r => r.overallScore))}%</span>
                </div>
                <div className="detail-row">
                  <span>This Month:</span>
                  <span>{reports.filter(r => new Date(r.date).getMonth() === new Date().getMonth()).length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Common Issues */}
          <div className="sidebar-section">
            <h3>Top Issues to Address</h3>
            <div className="performance-list">
              <div className="performance-item">
                <div className="performance-icon" style={{ background: '#fef2f2', color: '#ef4444' }}>
                  <i className="fas fa-comment"></i>
                </div>
                <div className="performance-info">
                  <h4>Filler Words</h4>
                  <p>Most common issue</p>
                </div>
                <div className="performance-badge" style={{ background: '#ef4444' }}>High</div>
              </div>
              <div className="performance-item">
                <div className="performance-icon" style={{ background: '#fefce8', color: '#ca8a04' }}>
                  <i className="fas fa-align-left"></i>
                </div>
                <div className="performance-info">
                  <h4>Answer Length</h4>
                  <p>Could be improved</p>
                </div>
                <div className="performance-badge" style={{ background: '#ca8a04' }}>Med</div>
              </div>
              <div className="performance-item">
                <div className="performance-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                  <i className="fas fa-sitemap"></i>
                </div>
                <div className="performance-info">
                  <h4>Structure</h4>
                  <p>Generally good</p>
                </div>
                <div className="performance-badge" style={{ background: '#16a34a' }}>Low</div>
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
            <div className="notification-card" style={{ cursor: 'pointer' }}>
              <div className="notification-content">
                <h4>Share Report</h4>
                <p>Export or share results</p>
              </div>
              <div className="notification-action">
                <i className="fas fa-share"></i>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
