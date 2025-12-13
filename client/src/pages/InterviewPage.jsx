import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api } from '../api';

// Reusable PillButton component
const PillButton = ({ label, selected, onClick, disabled = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`
      px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 
      transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2
      ${selected 
        ? 'bg-black text-white shadow-md' 
        : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400 hover:bg-gray-50'
      }
      ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    `}
  >
    {label}
  </button>
);

// Reusable SearchInput component
const SearchInput = ({ placeholder, value, onChange }) => (
  <div className="relative mb-4">
    <svg 
      className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 
        focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
    />
  </div>
);

// Selection Section component
const SelectionSection = ({ title, children }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6 transition-all duration-300 hover:shadow-md">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
    {children}
  </div>
);

export default function InterviewPage() {
  const navigate = useNavigate();
  const { id: interviewId } = useParams();  // Get interview ID from URL if present
  
  // Loading states for API mode
  const [loading, setLoading] = useState(!!interviewId);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Interview data from API (for application mode)
  const [interviewData, setInterviewData] = useState(null);
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  
  // Interview setup state (for practice mode without ID)
  const [setupState, setSetupState] = useState({
    company: '',
    level: '',
    role: '',
    skills: [],
    duration: 45
  });
  
  // Search states
  const [companySearch, setCompanySearch] = useState('');
  const [skillSearch, setSkillSearch] = useState('');
  
  // Interview session state
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [answers, setAnswers] = useState({});
  const [videoEnabled, setVideoEnabled] = useState(true);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Data options for practice mode
  const companies = ['TechCorp', 'InnovDesigns', 'MedGen', 'StartupX', 'DataFlow', 'CloudNine'];
  const levels = ['Junior', 'Mid', 'Senior'];
  const roles = ['Software Engineer', 'Product Manager', 'Data Scientist', 'UX Designer', 'DevOps Engineer'];
  const skillOptions = ['Algorithms', 'System Design', 'Leadership', 'Communication', 'Problem Solving', 'Data Structures', 'API Design', 'Testing'];

  // Filter companies and skills based on search
  const filteredCompanies = companies.filter(c => 
    c.toLowerCase().includes(companySearch.toLowerCase())
  );
  const filteredSkills = skillOptions.filter(s => 
    s.toLowerCase().includes(skillSearch.toLowerCase())
  );

  // Fetch interview data from API if we have an ID
  useEffect(() => {
    async function fetchInterview() {
      if (!interviewId) return;
      
      try {
        setLoading(true);
        const data = await api.getInterview(interviewId);
        
        if (data.status === 'completed') {
          navigate(`/report/${interviewId}`, { replace: true });
          return;
        }
        
        setInterviewData(data);
        setQuestions(data.questions || []);
        setQuestionIndex(data.currentQuestionIndex || 0);
        setJobTitle(data.jobTitle || '');
        setCompanyName(data.companyName || '');
        
        // Restore existing answers
        const existingAnswers = {};
        (data.answers || []).forEach(a => {
          existingAnswers[a.questionId] = a.transcript;
        });
        setAnswers(existingAnswers);
        
        // Auto-start interview when we have data from API
        setInterviewStarted(true);
      } catch (err) {
        setError(err.message || 'Failed to load interview');
      } finally {
        setLoading(false);
      }
    }
    
    fetchInterview();
  }, [interviewId, navigate]);

  // Calculate dynamic duration for practice mode
  useEffect(() => {
    if (interviewId) return; // Skip for API mode
    
    let duration = 45;
    duration += setupState.skills.length * 10;
    if (setupState.level === 'Senior') duration += 5;
    if (setupState.level === 'Mid') duration += 2;
    setSetupState(prev => ({ ...prev, duration }));
  }, [setupState.skills, setupState.level, interviewId]);

  // Load saved answer when question changes
  useEffect(() => {
    if (questions[questionIndex]) {
      const questionId = questions[questionIndex].id;
      setAnswer(answers[questionId] || '');
    }
  }, [questionIndex, questions, answers]);

  // Check if form is valid (practice mode)
  const isFormValid = setupState.company && setupState.level && setupState.role;

  // Selection handlers for practice mode
  const handleCompanySelect = (company) => {
    setSetupState(prev => ({ ...prev, company }));
  };

  const handleLevelSelect = (level) => {
    setSetupState(prev => ({ ...prev, level }));
  };

  const handleRoleSelect = (role) => {
    setSetupState(prev => ({ ...prev, role }));
  };

  const handleSkillToggle = (skill) => {
    setSetupState(prev => {
      const skills = prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : prev.skills.length < 5 
          ? [...prev.skills, skill]
          : prev.skills;
      return { ...prev, skills };
    });
  };

  // Generate mock questions for practice mode
  const generatePracticeQuestions = () => {
    const baseQuestions = [
      { id: 'p1', text: `Tell me about yourself and why you're interested in ${setupState.company}.`, type: 'behavioral' },
      { id: 'p2', text: `What makes you a good fit for a ${setupState.level} ${setupState.role} position?`, type: 'behavioral' },
      { id: 'p3', text: `Describe a challenging project you worked on.`, type: 'technical' },
      { id: 'p4', text: `How do you handle tight deadlines and pressure?`, type: 'behavioral' },
      { id: 'p5', text: `Where do you see yourself in 5 years?`, type: 'behavioral' },
    ];
    
    setupState.skills.forEach((skill, idx) => {
      baseQuestions.push({
        id: `s${idx}`,
        text: `Can you tell me about your experience with ${skill}?`,
        type: 'technical'
      });
    });
    
    return baseQuestions;
  };

  // Initialize webcam
  useEffect(() => {
    if (interviewStarted && videoEnabled) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.error('Error accessing webcam:', err);
          setVideoEnabled(false);
        });
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [interviewStarted, videoEnabled]);

  const handleStartInterview = async () => {
    if (!interviewId && isFormValid) {
      // Practice mode - generate questions locally
      const practiceQuestions = generatePracticeQuestions();
      setQuestions(practiceQuestions);
      sessionStorage.setItem('interviewSetup', JSON.stringify(setupState));
      setInterviewStarted(true);
      setQuestionIndex(0);
    }
  };

  const handleSubmitAnswer = async (skipped = false) => {
    const currentQuestion = questions[questionIndex];
    if (!currentQuestion) return;
    
    // Save answer locally
    if (!skipped) {
      setAnswers(prev => ({
        ...prev,
        [currentQuestion.id]: answer,
      }));
    }
    
    // If we have an interview ID, submit to API
    if (interviewId) {
      try {
        setSubmitting(true);
        setError('');
        
        const result = await api.submitAnswer(
          interviewId,
          currentQuestion.id,
          skipped ? '' : answer,
          skipped
        );
        
        // Auto-complete: if backend says completed, go to report
        if (result.completed) {
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
          }
          navigate(`/report/${interviewId}`);
          return;
        }
      } catch (err) {
        setError(err.message || 'Failed to submit answer');
        setSubmitting(false);
        return;
      } finally {
        setSubmitting(false);
      }
    }
    
    // Move to next question
    if (questionIndex < questions.length - 1) {
      setQuestionIndex(questionIndex + 1);
      setAnswer('');
    } else {
      handleEndInterview();
    }
  };

  const handleSkipQuestion = () => {
    handleSubmitAnswer(true);
  };

  const handleNextQuestion = () => {
    if (questionIndex < questions.length - 1) {
      if (answer.trim()) {
        setAnswers(prev => ({
          ...prev,
          [questions[questionIndex].id]: answer,
        }));
      }
      setQuestionIndex(questionIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (questionIndex > 0) {
      if (answer.trim()) {
        setAnswers(prev => ({
          ...prev,
          [questions[questionIndex].id]: answer,
        }));
      }
      setQuestionIndex(questionIndex - 1);
    }
  };

  const handleEndInterview = async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    
    if (interviewId) {
      try {
        await api.completeInterview(interviewId);
        navigate(`/report/${interviewId}`);
      } catch (err) {
        console.error('Failed to complete:', err);
        navigate(`/report/${interviewId}`);
      }
    } else {
      // Practice mode - just go to home
      navigate('/home');
    }
  };

  const toggleVideo = () => {
    if (videoRef.current && streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const currentQuestion = questions[questionIndex];

  // Loading state (API mode)
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading interview...</p>
        </div>
      </div>
    );
  }

  // Error state (API mode)
  if (error && !interviewStarted) {
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

  // Setup Page (practice mode - no interview ID)
  if (!interviewStarted && !interviewId) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Navbar */}
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link to="/" className="text-xl font-semibold text-gray-900 hover:text-gray-600 transition-colors">
              InterviewAI
            </Link>
            <div className="flex items-center gap-6">
              <Link to="/home" className="text-gray-600 hover:text-gray-900 transition-colors">Dashboard</Link>
              <Link to="/profile" className="text-gray-600 hover:text-gray-900 transition-colors">Profile</Link>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-3xl mx-auto px-6 py-12">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Setup Your Interview</h1>
            <p className="text-gray-500">Configure your mock interview session</p>
          </div>

          <div className="space-y-6">
            <SelectionSection title="Select Company">
              <SearchInput 
                placeholder="Search Company" 
                value={companySearch} 
                onChange={setCompanySearch} 
              />
              <div className="flex flex-wrap gap-3">
                {filteredCompanies.map(company => (
                  <PillButton
                    key={company}
                    label={company}
                    selected={setupState.company === company}
                    onClick={() => handleCompanySelect(company)}
                  />
                ))}
              </div>
            </SelectionSection>

            <SelectionSection title="Select Level">
              <div className="flex flex-wrap gap-3">
                {levels.map(level => (
                  <PillButton
                    key={level}
                    label={level}
                    selected={setupState.level === level}
                    onClick={() => handleLevelSelect(level)}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-400 mt-3">* Required — Level affects question difficulty</p>
            </SelectionSection>

            <SelectionSection title="Select Job Role">
              <div className="flex flex-wrap gap-3">
                {roles.map(role => (
                  <PillButton
                    key={role}
                    label={role}
                    selected={setupState.role === role}
                    onClick={() => handleRoleSelect(role)}
                  />
                ))}
              </div>
            </SelectionSection>

            <SelectionSection title={`Select Skills (${setupState.skills.length}/5 selected)`}>
              <SearchInput 
                placeholder="Search Skill Focus" 
                value={skillSearch} 
                onChange={setSkillSearch} 
              />
              <div className="flex flex-wrap gap-3">
                {filteredSkills.map(skill => (
                  <PillButton
                    key={skill}
                    label={skill}
                    selected={setupState.skills.includes(skill)}
                    onClick={() => handleSkillToggle(skill)}
                    disabled={!setupState.skills.includes(skill) && setupState.skills.length >= 5}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-400 mt-3">Select up to 5 skills to focus on</p>
            </SelectionSection>

            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-1">Estimated Interview Duration</h3>
                  <p className="text-gray-400 text-sm">Based on your selections</p>
                </div>
                <div className="text-4xl font-bold">
                  {setupState.duration} <span className="text-lg font-normal text-gray-400">min</span>
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <button
                onClick={handleStartInterview}
                disabled={!isFormValid}
                className={`
                  px-12 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform
                  ${isFormValid 
                    ? 'bg-black text-white hover:bg-gray-800 hover:scale-105 shadow-lg hover:shadow-xl' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                Start Interview
              </button>
            </div>

            {!isFormValid && (
              <p className="text-center text-sm text-gray-400">
                Please select Company, Level, and Job Role to continue
              </p>
            )}
          </div>
        </main>
      </div>
    );
  }

  // Interview Session Page
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-semibold text-gray-900">
            InterviewAI
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              {interviewId 
                ? `${companyName || 'Company'} • ${jobTitle || 'Interview'}`
                : `${setupState.company} • ${setupState.level} ${setupState.role}`
              }
            </span>
            <button
              onClick={handleEndInterview}
              disabled={submitting}
              className="px-4 py-2 text-red-500 hover:text-red-600 font-medium transition-colors disabled:opacity-50"
            >
              End Interview
            </button>
          </div>
        </div>
      </nav>

      {/* Interview Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Webcam Video Panel */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Video Feed</h2>
              <button
                onClick={toggleVideo}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200
                  ${videoEnabled 
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                    : 'bg-black text-white hover:bg-gray-800'
                  }`}
              >
                {videoEnabled ? 'Disable Video' : 'Enable Video'}
              </button>
            </div>
            <div className="bg-gray-100 rounded-xl overflow-hidden aspect-video border border-gray-200">
              {videoEnabled ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <svg className="w-16 h-16 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Video Disabled
                  </div>
                </div>
              )}
            </div>
            <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-sm text-gray-600">Recording in progress</span>
              </div>
            </div>
          </div>

          {/* Question & Answer Panel */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Question {questionIndex + 1} of {questions.length}
                </h2>
                {currentQuestion?.type && (
                  <span className={`text-xs font-medium px-3 py-1 rounded-full
                    ${currentQuestion.type === 'technical' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {currentQuestion.type}
                  </span>
                )}
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-gray-100 rounded-full h-1.5 mb-6">
                <div 
                  className="bg-black h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${((questionIndex + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <p className="text-gray-900 text-lg leading-relaxed">{currentQuestion?.text}</p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Answer</label>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                disabled={submitting}
                rows={6}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 
                  focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none transition-all duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Type your answer here..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleSubmitAnswer(false)}
                disabled={!answer.trim() || submitting}
                className={`flex-1 px-6 py-3 rounded-full font-medium transition-all duration-200
                  ${answer.trim() && !submitting
                    ? 'bg-black text-white hover:bg-gray-800' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
              >
                {submitting ? 'Submitting...' : 'Submit Answer'}
              </button>
              <button
                onClick={handleSkipQuestion}
                disabled={submitting}
                className="px-6 py-3 border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300 font-medium rounded-full transition-all duration-200 disabled:opacity-50"
              >
                Skip
              </button>
            </div>

            {/* Navigation */}
            <div className="flex gap-3 mt-3">
              <button
                onClick={handlePrevQuestion}
                disabled={questionIndex === 0 || submitting}
                className={`flex-1 px-6 py-3 border border-gray-200 font-medium rounded-full transition-all duration-200
                  ${questionIndex > 0 && !submitting
                    ? 'text-gray-600 hover:text-gray-900 hover:border-gray-300' 
                    : 'text-gray-300 cursor-not-allowed'
                  }`}
              >
                ← Previous
              </button>
              <button
                onClick={handleNextQuestion}
                disabled={questionIndex >= questions.length - 1 || submitting}
                className={`flex-1 px-6 py-3 border border-gray-200 font-medium rounded-full transition-all duration-200
                  ${questionIndex < questions.length - 1 && !submitting
                    ? 'text-gray-600 hover:text-gray-900 hover:border-gray-300' 
                    : 'text-gray-300 cursor-not-allowed'
                  }`}
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
