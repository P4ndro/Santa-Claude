import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { api } from '../api';

export default function InterviewPage() {
  const { id: interviewId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const [questions, setQuestions] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [answers, setAnswers] = useState({}); // questionId -> transcript
  
  const [videoEnabled, setVideoEnabled] = useState(true);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  
  // Free TTS Interviewer (browser-based, no API costs)
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechSynthesisRef = useRef(null);
  const interviewerVideoRef = useRef(null);
  
  // STT (Speech-to-Text) - Web Speech API
  const [isRecording, setIsRecording] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef(null);
  const isRecordingRef = useRef(false);
  
  // Check if Speech Recognition is supported
  const recognitionSupported = typeof window !== 'undefined' && 
    (window.SpeechRecognition || window.webkitSpeechRecognition);

  // Fetch interview data on mount
  useEffect(() => {
    async function fetchInterview() {
      try {
        setLoading(true);
        const data = await api.getInterview(interviewId);
        
        if (data.status === 'completed') {
          // Interview already completed, redirect to report
          navigate(`/report/${interviewId}`, { replace: true });
          return;
        }
        
        setQuestions(data.questions);
        setQuestionIndex(data.currentQuestionIndex || 0);
        
        // Restore any existing answers
        const existingAnswers = {};
        (data.answers || []).forEach(a => {
          existingAnswers[a.questionId] = a.transcript;
        });
        setAnswers(existingAnswers);
        
      } catch (err) {
        setError(err.message || 'Failed to load interview');
      } finally {
        setLoading(false);
      }
    }
    
    if (interviewId) {
      fetchInterview();
    }
  }, [interviewId, navigate]);

  // Initialize webcam
  useEffect(() => {
    if (!loading && videoEnabled) {
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
  }, [loading, videoEnabled]);

  // Load saved answer when question changes
  useEffect(() => {
    if (questions[questionIndex]) {
      const questionId = questions[questionIndex].id;
      setAnswer(answers[questionId] || '');
      // Stop recording when question changes - DISABLED (STT is disabled)
      // if (isRecording) {
      //   setIsRecording(false);
      // }
      // Auto-start recording - DISABLED (STT is disabled)
      // if (recognitionSupported && !answers[questionId]) {
      //   const timer = setTimeout(() => {
      //     if (!isRecording) {
      //       startRecording();
      //     }
      //   }, 2000);
      //   return () => clearTimeout(timer);
      // }
    }
  }, [questionIndex, questions, answers]);

  const currentQuestion = questions[questionIndex];
  
  // Check if current question is code-based and detect language
  const isCodeQuestion = currentQuestion && (
    currentQuestion.type === 'technical' ||
    currentQuestion.category?.toLowerCase().includes('algorithm') ||
    currentQuestion.category?.toLowerCase().includes('coding') ||
    currentQuestion.category?.toLowerCase().includes('code') ||
    (currentQuestion.text?.toLowerCase().includes('write') && currentQuestion.text?.toLowerCase().includes('code')) ||
    currentQuestion.text?.toLowerCase().includes('implement') ||
    currentQuestion.text?.toLowerCase().includes('function') ||
    currentQuestion.text?.includes('```')
  );
  
  // Detect programming language from question text
  const detectLanguage = () => {
    if (!currentQuestion?.text) return 'javascript';
    const text = currentQuestion.text.toLowerCase();
    if (text.includes('python')) return 'python';
    if (text.includes('java') && !text.includes('javascript')) return 'java';
    if (text.includes('c++') || text.includes('cpp')) return 'cpp';
    if (text.includes('c#') || text.includes('csharp')) return 'csharp';
    if (text.includes('typescript')) return 'typescript';
    if (text.includes('go ') || text.includes('golang')) return 'go';
    if (text.includes('rust')) return 'rust';
    if (text.includes('ruby')) return 'ruby';
    if (text.includes('php')) return 'php';
    if (text.includes('swift')) return 'swift';
    if (text.includes('kotlin')) return 'kotlin';
    return 'javascript'; // Default to JavaScript
  };
  
  const codeLanguage = isCodeQuestion ? detectLanguage() : 'javascript';

  // Helper function to safely switch video
  const switchVideo = (videoSrc) => {
    if (!interviewerVideoRef.current) return;
    
    const video = interviewerVideoRef.current;
    
    // Get current video source (handle both full URL and relative path)
    const currentSrc = video.src || video.currentSrc || '';
    const isSameVideo = currentSrc.includes(videoSrc) || currentSrc.endsWith(videoSrc);
    
    // If already playing the same video, don't switch
    if (isSameVideo && !video.paused) return;
    
    // Wait for current video operations to complete
    const handleVideoSwitch = () => {
      // Cancel any pending play promises
      if (video.pause) {
        video.pause();
      }
      
      video.src = videoSrc;
      video.load(); // Load the new video
      
      // Wait for video to be ready before playing
      const playVideo = () => {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              // Video started playing successfully
            })
            .catch(err => {
              // Ignore abort errors (happens when switching videos quickly)
              if (err.name !== 'AbortError' && err.name !== 'NotAllowedError') {
                console.warn('Video play error:', err.name, err.message);
              }
            });
        }
      };
      
      if (video.readyState >= 2) {
        // Video is already loaded
        playVideo();
      } else {
        // Wait for video to load
        const onLoadedData = () => {
          playVideo();
        };
        video.addEventListener('loadeddata', onLoadedData, { once: true });
        
        // Fallback timeout in case loadeddata doesn't fire
        setTimeout(() => {
          video.removeEventListener('loadeddata', onLoadedData);
          if (video.readyState >= 2) {
            playVideo();
          }
        }, 1000);
      }
    };
    
    // If video is currently playing, pause and wait a bit
    if (!video.paused) {
      video.pause();
      // Small delay to let pause complete
      setTimeout(handleVideoSwitch, 100);
    } else {
      handleVideoSwitch();
    }
  };

  // Free TTS: Speak question when it changes (browser Web Speech API - 100% free)
  useEffect(() => {
    // Initialize video to idle state (aii2.mp4) when question loads
    if (interviewerVideoRef.current && currentQuestion && !loading) {
      // Set loop property
      interviewerVideoRef.current.loop = true;
      // Initialize with idle video
      switchVideo('/aii2.mp4');
    }

    if (currentQuestion?.text && !loading) {
      // Small delay to let video initialize before speaking
      const timer = setTimeout(() => {
        speakQuestion(currentQuestion.text);
      }, 300);
      
      return () => {
        clearTimeout(timer);
        if (speechSynthesisRef.current) {
          window.speechSynthesis.cancel();
        }
      };
    }

    // Cleanup: stop speaking when component unmounts or question changes
    return () => {
      if (speechSynthesisRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentQuestion, loading]);

  // Load voices (some browsers need this)
  useEffect(() => {
    const loadVoices = () => {
      window.speechSynthesis.getVoices();
    };
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // STT (Speech-to-Text) - DISABLED for now (only TTS enabled)
  // Initialize Speech Recognition (STT) - COMMENTED OUT
  useEffect(() => {
    // STT disabled - only TTS (text-to-speech) is enabled
    // Browser will speak questions to you, but you need to type answers manually
    return () => {
      // Cleanup - stop TTS on unmount
      window.speechSynthesis.cancel();
    };
  }, []); // Only run once on mount
  
  /* COMMENTED OUT - STT INITIALIZATION
  useEffect(() => {
    // Check browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setRecognitionSupported(true);
      
      // Initialize recognition
      const recognition = new SpeechRecognition();
      recognition.continuous = true; // Keep listening continuously
      recognition.interimResults = true; // Show interim results as you speak
      recognition.lang = 'en-US'; // Language
      recognition.maxAlternatives = 1; // Only get the best result
      
      // Handle results - converts your speech to text in real-time
      recognition.onresult = (event) => {
        let interimText = '';
        let finalText = '';
        
        // Process all results from the current index
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            // Final transcript - this is confirmed speech, add to answer
            finalText += transcript + ' ';
          } else {
            // Interim transcript - shows as you speak (real-time)
            interimText += transcript;
          }
        }
        
        // Add final transcript to answer (permanent)
        if (finalText.trim()) {
          setAnswer(prev => {
            // Avoid duplicates - check if this text is already at the end
            const trimmed = finalText.trim();
            if (prev.endsWith(trimmed)) {
              return prev;
            }
            // Add with space if there's existing text
            return prev + (prev && !prev.endsWith(' ') ? ' ' : '') + trimmed;
          });
          // Clear interim after adding final
          setInterimTranscript('');
        } else {
          // Show interim transcript in real-time as you speak
          setInterimTranscript(interimText);
        }
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
          // No speech detected - this is normal, just continue
          return;
        } else if (event.error === 'network') {
          // Network error - but don't give up immediately, try to recover
          const isOnline = navigator.onLine;
          if (!isOnline) {
            setHasNetworkError(true);
            setError('No internet connection detected. Speech recognition requires Wi-Fi or mobile data. Please connect to the internet.');
            setIsRecording(false);
            if (recognitionRef.current) {
              try {
                recognitionRef.current.stop();
              } catch (e) {}
            }
          } else {
            // Online but network error - might be temporary, try to recover automatically
            console.warn('Network error but browser says online - attempting automatic recovery');
            setIsRecovering(true);
            setError('Network issue detected. Attempting to reconnect...');
            
            // Don't stop immediately - try multiple times to recover
            let retryCount = 0;
            const maxRetries = 5; // Try up to 5 times
            
            const attemptRecovery = () => {
              if (isRecording && recognitionRef.current && navigator.onLine && retryCount < maxRetries) {
                retryCount++;
                setTimeout(() => {
                  if (isRecording && recognitionRef.current && navigator.onLine) {
                    try {
                      recognitionRef.current.start();
                      // Success! Clear error and recovery state
                      setError('');
                      setHasNetworkError(false);
                      setIsRecovering(false);
                      console.log('Speech recognition recovered successfully');
                    } catch (retryErr) {
                      // If retry fails, try again
                      if (retryCount < maxRetries) {
                        setError(`Reconnecting... (attempt ${retryCount + 1}/${maxRetries})`);
                        attemptRecovery();
                      } else {
                        // All retries failed - show error
                        setHasNetworkError(true);
                        setIsRecovering(false);
                        setError('Network error: Unable to connect to speech recognition service after multiple attempts. Your connection may be slow or unstable. Please check your internet and try again, or type your answer manually.');
                        setIsRecording(false);
                      }
                    }
                  } else {
                    setIsRecovering(false);
                  }
                }, 1500 * retryCount); // Increasing delay between retries (1.5s, 3s, 4.5s, etc.)
              } else {
                setIsRecovering(false);
              }
            };
            
            // Start recovery attempts
            attemptRecovery();
          }
        } else if (event.error === 'audio-capture') {
          setError('Microphone not accessible. Please check permissions.');
          setIsRecording(false);
        } else if (event.error === 'not-allowed') {
          setError('Microphone permission denied. Please allow microphone access.');
          setIsRecording(false);
        } else if (event.error === 'aborted') {
          // Recognition was aborted - this is normal when stopping
          return;
        } else {
          setError(`Speech recognition error: ${event.error}. Please check your internet connection.`);
          setIsRecording(false);
        }
      };
      
      recognition.onend = () => {
        // CRITICAL: Recognition stops automatically after periods of silence
        // We MUST restart it continuously to keep listening
        // If we're still supposed to be recording, restart immediately
        // But NOT if there was a network error (prevents infinite retry loop)
        if (isRecording && !hasNetworkError && recognitionRef.current) {
          // Use setTimeout to ensure recognition is fully stopped before restarting
          setTimeout(() => {
            if (isRecording && !hasNetworkError && recognitionRef.current) {
              try {
                // Restart to keep listening - this is essential for continuous recording
                recognitionRef.current.start();
              } catch (err) {
                // If already starting (InvalidStateError), that's fine - it will work
                // Only log real errors
                if (err.name !== 'InvalidStateError') {
                  console.error('Error restarting recognition:', err);
                  // If it's a network error, stop trying
                  if (err.message && err.message.includes('network')) {
                    setHasNetworkError(true);
                    setIsRecording(false);
                  } else {
                    // For other errors, try once more after a delay
                    setTimeout(() => {
                      if (isRecording && !hasNetworkError && recognitionRef.current) {
                        try {
                          recognitionRef.current.start();
                        } catch (retryErr) {
                          // If still failing, might be a real error
                          if (retryErr.name !== 'InvalidStateError') {
                            console.error('Retry failed:', retryErr);
                          }
                        }
                      }
                    }, 1000);
                  }
                }
              }
            }
          }, 100); // Small delay to ensure clean restart
        }
      };
      
      recognitionRef.current = recognition;
    } else {
      setRecognitionSupported(false);
      console.warn('Speech recognition not supported in this browser');
    }
    
    // Cleanup
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []); // Only run once on mount
  END OF COMMENTED OUT STT INITIALIZATION */

  // Handle recording state changes - DISABLED (STT is disabled)
  // useEffect(() => { ... }, [isRecording]);

  const speakQuestion = (text) => {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Check if browser supports speech synthesis
    if (!('speechSynthesis' in window)) {
      console.warn('Browser does not support speech synthesis');
      return;
    }

    // Create speech utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure voice (prefer male voice)
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Male') || 
      voice.name.includes('David') || 
      voice.name.includes('Mark') ||
      voice.name.includes('Alex') ||
      voice.name.includes('Daniel') ||
      voice.name.includes('Tom') ||
      voice.name.includes('Microsoft David') ||
      voice.name.includes('Microsoft Mark') ||
      (voice.lang.startsWith('en') && voice.gender === 'male')
    ) || voices.find(voice => voice.lang.startsWith('en')) || voices[0];
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Handle events
    utterance.onstart = () => {
      setIsSpeaking(true);
      // Switch to speaking video (aii1.mp4)
      switchVideo('/aii1.mp4');
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      // Switch to idle video (aii2.mp4)
      switchVideo('/aii2.mp4');
    };

    utterance.onerror = (error) => {
      // Only log non-abort errors
      if (error.error !== 'interrupted' && error.error !== 'canceled') {
        console.warn('Speech synthesis error:', error.error);
      }
      setIsSpeaking(false);
      // Switch to idle video on error
      switchVideo('/aii2.mp4');
    };

    // Start speaking
    window.speechSynthesis.speak(utterance);
    speechSynthesisRef.current = utterance;
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    // Switch to idle video when stopped
    switchVideo('/aii2.mp4');
  };

  // STT Functions - Web Speech API
  const startRecording = () => {
    if (!recognitionSupported) {
      setError('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    if (!navigator.onLine) {
      setError('You are offline. Speech recognition requires an internet connection.');
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
        isRecordingRef.current = true;
        setInterimTranscript('');
      };

      recognition.onresult = (event) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcript + ' ';
          } else {
            interim += transcript;
          }
        }

        setInterimTranscript(interim);

        if (final) {
          setAnswer(prev => {
            const newAnswer = prev + (prev && !prev.endsWith(' ') ? ' ' : '') + final.trim();
            return newAnswer;
          });
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        
        if (event.error === 'no-speech' || event.error === 'aborted') {
          return;
        }
        
        if (event.error === 'network') {
          setError('Network error: Speech recognition requires internet. Check your connection or type manually.');
          stopRecording();
          return;
        }
        
        if (event.error === 'not-allowed') {
          setError('Microphone permission denied. Please allow microphone access.');
          stopRecording();
          return;
        }
        
        setError(`Speech recognition error: ${event.error}. Please type your answer manually.`);
        stopRecording();
      };

      recognition.onend = () => {
        if (isRecordingRef.current && recognitionRef.current === recognition) {
          try {
            recognition.start();
          } catch (err) {
            setIsRecording(false);
            isRecordingRef.current = false;
            setInterimTranscript('');
          }
        } else {
          setIsRecording(false);
          isRecordingRef.current = false;
          setInterimTranscript('');
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setError('Failed to start speech recognition. Please try again.');
      setIsRecording(false);
    }
  };
  
  const stopRecording = () => {
    isRecordingRef.current = false;
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);
    setInterimTranscript('');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleSubmitAnswer = async (skipped = false) => {
    if (!currentQuestion) return;
    
    try {
      setSubmitting(true);
      setError('');
      
      const result = await api.submitAnswer(
        interviewId,
        currentQuestion.id,
        skipped ? '' : answer,
        skipped
      );
      
      console.log('Submit answer result:', result); // Debug log
      
      // Save answer locally
      if (!skipped) {
        setAnswers(prev => ({
          ...prev,
          [currentQuestion.id]: answer,
        }));
      }
      
      // Check if interview is completed
      const isCompleted = result.completed || 
                         (result.allAnswered && result.answersCount >= questions.length) ||
                         (questionIndex === questions.length - 1 && result.answersCount >= questions.length);
      
      if (isCompleted) {
        console.log('Interview completed, navigating to report...'); // Debug log
        // Stop webcam
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }
        // Navigate to report immediately
        navigate(`/report/${interviewId}`, { replace: true });
        return;
      }
      
      // Move to next question (only if not completed)
      if (questionIndex < questions.length - 1) {
        setQuestionIndex(questionIndex + 1);
        setAnswer('');
      } else {
        // We're on the last question but backend didn't mark as completed
        // This shouldn't happen, but if it does, try to complete manually
        console.warn('Last question answered but interview not marked as completed');
        // Wait a moment and check again
        setTimeout(async () => {
          try {
            const interviewData = await api.getInterview(interviewId);
            if (interviewData.status === 'completed') {
              navigate(`/report/${interviewId}`, { replace: true });
            }
          } catch (err) {
            console.error('Error checking interview status:', err);
          }
        }, 500);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkipQuestion = () => {
    handleSubmitAnswer(true);
  };

  const handleNextQuestion = () => {
    if (questionIndex < questions.length - 1) {
      // Save current answer state locally (without submitting to API)
      if (answer.trim()) {
        setAnswers(prev => ({
          ...prev,
          [currentQuestion.id]: answer,
        }));
      }
      setQuestionIndex(questionIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (questionIndex > 0) {
      // Save current answer state locally
      if (answer.trim()) {
        setAnswers(prev => ({
          ...prev,
          [currentQuestion.id]: answer,
        }));
      }
      setQuestionIndex(questionIndex - 1);
    }
  };

  const handleEndInterview = async () => {
    try {
      setSubmitting(true);
      
    // Stop webcam
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
      
      // Complete interview
      await api.completeInterview(interviewId);
      
      // Navigate to report
      navigate(`/report/${interviewId}`);
    } catch (err) {
      setError(err.message || 'Failed to complete interview');
      setSubmitting(false);
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

  if (loading) {
    return (
      <div className="h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg font-medium">Connecting to interview...</p>
        </div>
      </div>
    );
  }

  if (error && questions.length === 0) {
    return (
      <div className="h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-red-400 mb-6 text-lg">{error}</p>
          <button
            onClick={() => navigate('/home')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-lg"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col overflow-hidden">
      {/* Minimal Header - Hidden until hover */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent px-6 py-3 opacity-0 hover:opacity-100 transition-opacity duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              <span className="text-xs text-white font-medium">LIVE</span>
            </div>
            <span className="text-xs px-2 py-1 rounded bg-white/20 text-white backdrop-blur-sm">
              Question {questionIndex + 1}/{questions.length}
            </span>
            <span className="text-xs px-2 py-1 rounded bg-white/20 text-white backdrop-blur-sm">
              {currentQuestion?.type || 'behavioral'}
            </span>
          </div>
          <button
            onClick={handleEndInterview}
            disabled={submitting}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors disabled:opacity-50 text-sm"
          >
            {submitting ? 'Ending...' : 'End Call'}
          </button>
        </div>
      </div>

      {/* Main Content - Two Camera Layout */}
      <div className="flex-1 grid grid-cols-2 gap-0 overflow-hidden relative">
        {/* AI Interviewer Video - Left Side */}
        <div className="bg-black relative overflow-hidden group">
          {/* Video */}
          <video
            ref={interviewerVideoRef}
            className="w-full h-full object-cover"
            loop
            muted
            playsInline
            preload="auto"
            onError={(e) => {
              console.warn('Video load error:', e);
            }}
          >
            <source src="/aii2.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          
          {/* Overlay info - bottom left */}
          <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-lg">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-white font-medium">AI Interviewer</span>
            </div>
            {isSpeaking && (
              <div className="px-3 py-1.5 bg-red-500/80 backdrop-blur-md rounded-lg animate-pulse">
                <span className="text-xs text-white font-medium flex items-center gap-1">
                  <span>🔊</span> Speaking
                </span>
              </div>
            )}
          </div>

          {/* Controls overlay - hidden until hover */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex gap-2">
              <button
                onClick={() => speakQuestion(currentQuestion?.text || '')}
                disabled={isSpeaking}
                className="px-4 py-2 bg-white/90 hover:bg-white disabled:bg-white/50 disabled:cursor-not-allowed text-black text-sm font-medium rounded-lg transition backdrop-blur-sm shadow-lg"
              >
                {isSpeaking ? '🔊 Speaking...' : '🔊 Replay'}
              </button>
              {isSpeaking && (
                <button
                  onClick={stopSpeaking}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition shadow-lg"
                >
                  ⏹ Stop
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Candidate Webcam - Right Side */}
        <div className="bg-black relative overflow-hidden group">
          {videoEnabled ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-800">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-700 flex items-center justify-center">
                  <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"/>
                  </svg>
                </div>
                <p className="text-gray-400 text-sm">Camera Off</p>
              </div>
            </div>
          )}
          
          {/* Overlay info - bottom left */}
          <div className="absolute bottom-4 left-4 z-10">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-lg">
              <div className={`w-2 h-2 rounded-full ${videoEnabled ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
              <span className="text-xs text-white font-medium">You</span>
            </div>
          </div>

          {/* Controls overlay - hidden until hover */}
          <div className="absolute bottom-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={toggleVideo}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition shadow-lg backdrop-blur-sm ${
                videoEnabled 
                  ? 'bg-white/90 hover:bg-white text-black' 
                  : 'bg-red-600/90 hover:bg-red-700 text-white'
              }`}
            >
              {videoEnabled ? '📹 Camera On' : '📹 Camera Off'}
            </button>
          </div>
        </div>
      </div>

      {/* Question & Answer Section - Bottom Panel (Slides up on hover) */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/95 via-black/90 to-transparent p-6 transform translate-y-[calc(100%-80px)] hover:translate-y-0 transition-transform duration-300 ease-in-out">
        <div className="max-w-6xl mx-auto">
          {/* Question Card */}
          <div className="mb-4">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 shadow-2xl">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">💬</span>
                </div>
                <div className="flex-1">
                  <p className="text-white text-lg leading-relaxed font-medium">{currentQuestion?.text}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Answer Section */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-white/90">Your Answer</label>
              {recognitionSupported && (
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={submitting}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg ${
                    isRecording
                      ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                      : 'bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm border border-white/20'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  title={isRecording ? 'Stop recording' : 'Start voice input'}
                >
                  {isRecording ? '🎤 Stop Recording' : '🎤 Voice Input'}
                </button>
              )}
            </div>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={3}
              disabled={submitting}
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-white/40 focus:ring-2 focus:ring-white/20 resize-none disabled:opacity-50 shadow-lg"
              placeholder={isRecording ? "Speak your answer... (or type)" : "Type your answer here or use voice input..."}
            />
            {isRecording && (
              <div className="mt-2 p-3 bg-red-500/20 backdrop-blur-md border border-red-500/30 rounded-lg">
                <p className="text-sm text-white flex items-center gap-2">
                  <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  Listening... {interimTranscript && <span className="text-white/70 italic">({interimTranscript})</span>}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => handleSubmitAnswer(false)}
              disabled={!answer.trim() || submitting}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:shadow-none"
            >
              {submitting ? 'Submitting...' : 'Submit Answer'}
            </button>
            <button
              onClick={handleSkipQuestion}
              disabled={submitting}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-all backdrop-blur-sm border border-white/20 disabled:opacity-50 shadow-lg"
            >
              Skip
            </button>
            {questionIndex > 0 && (
              <button
                onClick={handlePrevQuestion}
                disabled={submitting}
                className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-all backdrop-blur-sm border border-white/20 disabled:opacity-50"
              >
                ←
              </button>
            )}
            {questionIndex < questions.length - 1 && (
              <button
                onClick={handleNextQuestion}
                disabled={submitting}
                className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-all backdrop-blur-sm border border-white/20 disabled:opacity-50"
              >
                →
              </button>
            )}
          </div>

          {/* End Interview Button */}
          <div className="mt-4 pt-4 border-t border-white/20">
            <button
              onClick={handleEndInterview}
              disabled={submitting}
              className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:shadow-none"
            >
              {submitting ? 'Ending Interview...' : 'End Interview'}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-500/20 backdrop-blur-md border border-red-500/30 rounded-lg">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
