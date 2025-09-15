/**
 * @file ResultsPage.jsx
 * @description Results page for displaying challenge attempt results
 */

import React, { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useSidebar } from '../../../components/layout/Sidebar/Layout';
import { MyDeckContext } from '../../../contexts/MyDeckContext';
import LoadingScreen from '../../../components/layout/StatusScreen/LoadingScreen';
import ErrorScreen from '../../../components/layout/StatusScreen/ErrorScreen';
import ChallengeThemeProvider from '../components/ChallengeThemeProvider';
import { useChallengeApi } from '../services/challengeService';
import { useChallengeTheme } from '../hooks/useChallengeTheme';
import { useApi } from '../../../hooks/useApi';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWrench, faSearch, faCheck, faTimes, faStop, faClock, faCodeBranch } from "@fortawesome/free-solid-svg-icons";
import "../../../styles/components/challenge.scss";

// Icons for different challenge modes
const ModeIcons = {
  code_fixer: faWrench,
  output_tracing: faSearch,
  code_completion: faCodeBranch
};

// Difficulty colors
const getDifficultyColor = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case 'easy': return { background: '#1a3a2a', color: '#64ff96' }; // Dark green bg, bright green text
    case 'medium': return { background: '#3a2a1a', color: '#ffd700' }; // Dark orange bg, bright yellow text
    case 'hard': return { background: '#3a1a1a', color: '#ff6464' }; // Dark red bg, bright red text
    default: return { background: '#2a1a3a', color: '#a8a5e6' }; // Dark purple bg, bright purple text
  }
};

// Format time spent
const formatTimeSpent = (seconds, timerEnabled) => {
  if (!timerEnabled) return 'OFF';
  if (!seconds) return '0s';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${remainingSeconds}s`;
};

// Format hints used
const formatHintsUsed = (hintsUsed, hintsEnabled) => {
  if (!hintsEnabled) return 'OFF';
  if (!hintsUsed) return '0 hints';
  return `${hintsUsed} hint${hintsUsed !== 1 ? 's' : ''}`;
};

const ResultsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { topicId: topicIdParam } = useParams();
  const { user: currentUser } = useAuth();
  const { closeSidebar } = useSidebar();
  const { topicId: contextTopicId, subtopicId: contextSubtopicId, loadTopicOverview, refreshTopics } = useContext(MyDeckContext);
  const { getAllChallengeAttemptsForResults } = useChallengeApi();
  const { getThemeStyles } = useChallengeTheme();
  const { post } = useApi();
  
  // Use MyDeckContext for topic and subtopic IDs
  const topicId = contextTopicId || (topicIdParam ? parseInt(topicIdParam) : 1);
  const subtopicId = contextSubtopicId;
  
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
    const [hasResetFields, setHasResetFields] = useState(false);
  const [isRefreshed, setIsRefreshed] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      if (!currentUser?.id || !subtopicId) {
        setError('Missing user or subtopic information');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const results = await getAllChallengeAttemptsForResults(currentUser.id, parseInt(subtopicId));
        setAttempts(results);
        setError(null);
      } catch (err) {
        setError('Failed to load challenge results. Please try again.');
      } finally {
    setLoading(false);
      }
    };

    fetchResults();
  }, [currentUser?.id, subtopicId]); // Removed getAllChallengeAttemptsForResults from dependencies

  // Function to reset challenge fields
  const resetChallengeFields = useCallback(async () => {
    if (hasResetFields || !currentUser?.id || !subtopicId) return;
    
    // Set flag immediately to prevent multiple calls
    setHasResetFields(true);
    
    try {
      const response = await post(`/user_challenges/reset-challenge-fields/user/${currentUser.id}/subtopic/${subtopicId}`);
      
      if (!response.ok) {
        // Reset flag if failed
        setHasResetFields(false);
      }
    } catch (error) {
      // Reset flag if failed
      setHasResetFields(false);
    }
  }, [currentUser?.id, subtopicId, post]); // Removed hasResetFields from dependencies

  // Handle page refresh and navigation away - NO automatic calls
  useEffect(() => {
    // Check if page was refreshed
    const wasRefreshed = sessionStorage.getItem('resultsPageRefreshed');
    if (wasRefreshed) {
      sessionStorage.removeItem('resultsPageRefreshed');
      setIsRefreshed(true);
      // Redirect to lesson page
      navigate(`/lesson/${topicId}/${subtopicId}`);
      return;
    }

    // Single beforeunload handler for reset on refresh/close only
    const handleBeforeUnload = (e) => {
      // Set flag for refresh detection
      sessionStorage.setItem('resultsPageRefreshed', 'true');
      
      // Only reset on actual page refresh/close, not navigation
      if (!hasResetFields) {
        resetChallengeFields();
      }
    };

    // Reset fields when component unmounts (navigation away)
    const handleUnmount = () => {
      if (!hasResetFields) {
        resetChallengeFields();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      handleUnmount();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [navigate, topicId, subtopicId]); // Only depend on navigation values

  // React Router navigation protection - REMOVED to prevent infinite loop

  // Get unique challenge modes from attempts
  const availableModes = useMemo(() => {
    const modes = [...new Set(attempts.map(attempt => attempt.challenge_type))];
    return modes.filter(Boolean);
  }, [attempts]);

  // Get success/failure counts
  const successCount = attempts.filter(attempt => attempt.is_successful).length;
  const failureCount = attempts.filter(attempt => !attempt.is_successful).length;

  // Filter attempts based on active filter
  const filteredAttempts = useMemo(() => {
    switch (activeFilter) {
      case 'code_fixer':
        return attempts.filter(attempt => attempt.challenge_type === 'code_fixer');
      case 'output_tracing':
        return attempts.filter(attempt => attempt.challenge_type === 'output_tracing');
      case 'code_completion':
        return attempts.filter(attempt => attempt.challenge_type === 'code_completion');
      case 'successful':
        return attempts.filter(attempt => attempt.is_successful);
      case 'needs_work':
        return attempts.filter(attempt => !attempt.is_successful);
      default:
        return attempts;
    }
  }, [attempts, activeFilter]);

  // Function to get time limit based on difficulty
  const getTimeLimit = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 300;    // 5 minutes
      case 'medium': return 450;  // 7.5 minutes
      case 'hard': return 600;    // 10 minutes
      default: return 300;
    }
  };

  // Function to determine if a row should be highlighted and why
  const getRowHighlightInfo = (attempt) => {
    // Check for cancelled challenge (was_cancelled flag)
    const isCancelled = attempt.was_cancelled;
    
    // Check for time expired challenge (timer enabled and time_spent >= time limit)
    const timeLimit = getTimeLimit(attempt.challenge_difficulty);
    const isTimeExpired = attempt.timer_enabled && attempt.time_spent >= timeLimit;
    
    if (isCancelled) {
      return {
        shouldHighlight: true,
        reason: 'cancelled',
        icon: faStop,
        text: 'Cancelled'
      };
    }
    
    if (isTimeExpired) {
      return {
        shouldHighlight: true,
        reason: 'timeout',
        icon: faClock,
        text: 'Time Out'
      };
    }
    
    return {
      shouldHighlight: false,
      reason: null,
      icon: null,
      text: null
    };
  };

  // Get filter counts
  const getFilterCount = (filter) => {
    switch (filter) {
      case 'code_fixer':
        return attempts.filter(attempt => attempt.challenge_type === 'code_fixer').length;
      case 'output_tracing':
        return attempts.filter(attempt => attempt.challenge_type === 'output_tracing').length;
      case 'code_completion':
        return attempts.filter(attempt => attempt.challenge_type === 'code_completion').length;
      case 'successful':
        return successCount;
      case 'needs_work':
        return failureCount;
      default:
        return attempts.length;
    }
  };

  const handleGoBack = async () => {
    try {
      // Reset challenge fields before going back to my-deck
      await resetChallengeFields();
      
      // Refresh topics and topic overview to show updated unlock status
      await refreshTopics();
      if (loadTopicOverview) {
        await loadTopicOverview(topicId, true); // Force refresh
      }
    } catch (error) {
      // Continue anyway - don't block the user from going back
    }
    
    // Navigate back to my-deck page
    navigate(`/my-deck/${topicId}`);
    closeSidebar(); // Close sidebar after navigation
  };

  const themeStyles = getThemeStyles();

  if (loading) {
    return <LoadingScreen message="Loading results..." />;
  }

  if (error) {
    return <ErrorScreen message={error} />;
  }

  return (
    <ChallengeThemeProvider>
      <div className="resultsPageContainer">
        <div className="resultsPageSummary">
          <h2 className="resultsPageTitle">Challenge Results</h2>
          <p className="resultsPageDescription">
            Here's how you performed on your challenges:
          </p>

          {attempts.length > 0 ? (
            <div className="resultsPageResultsContainer" style={themeStyles}>
              {/* Filter Tabs */}
              <div className="resultsPageFilterTabs">
                <button
                  className={`resultsPageFilterTab ${activeFilter === 'all' ? 'resultsPageActive' : ''}`}
                  onClick={() => setActiveFilter('all')}
                >
                  All ({getFilterCount('all')})
                </button>
                
                {availableModes.includes('code_fixer') && (
                  <button
                    className={`resultsPageFilterTab ${activeFilter === 'code_fixer' ? 'resultsPageActive' : ''}`}
                    onClick={() => setActiveFilter('code_fixer')}
                  >
                    Code Fixer ({getFilterCount('code_fixer')})
                  </button>
                )}
                
                {availableModes.includes('output_tracing') && (
                  <button
                    className={`resultsPageFilterTab ${activeFilter === 'output_tracing' ? 'resultsPageActive' : ''}`}
                    onClick={() => setActiveFilter('output_tracing')}
                  >
                    Output Tracing ({getFilterCount('output_tracing')})
                  </button>
                )}
                
                {availableModes.includes('code_completion') && (
                  <button
                    className={`resultsPageFilterTab ${activeFilter === 'code_completion' ? 'resultsPageActive' : ''}`}
                    onClick={() => setActiveFilter('code_completion')}
                  >
                    Code Completion ({getFilterCount('code_completion')})
                  </button>
                )}
                
                <button
                  className={`resultsPageFilterTab ${activeFilter === 'successful' ? 'resultsPageActive' : ''}`}
                  onClick={() => setActiveFilter('successful')}
                >
                  Successful ({getFilterCount('successful')})
                </button>
                
                <button
                  className={`resultsPageFilterTab ${activeFilter === 'needs_work' ? 'resultsPageActive' : ''}`}
                  onClick={() => setActiveFilter('needs_work')}
                >
                  Needs Work ({getFilterCount('needs_work')})
                </button>
          </div>

              {/* Results Table */}
              <div className="resultsPageTableContainer">
                {filteredAttempts.length > 0 ? (
                  <table className="resultsPageResultsTable">
                     <thead>
                       <tr>
                         <th className="resultsPageHeaderCell">Challenge</th>
                         <th className="resultsPageHeaderCell">Game Mode</th>
                         <th className="resultsPageHeaderCell">Difficulty</th>
                         <th className="resultsPageHeaderCell">Result</th>
                         <th className="resultsPageHeaderCell">Time Spent</th>
                         <th className="resultsPageHeaderCell">Hints Used</th>
                       </tr>
                     </thead>
                    <tbody>
                      {filteredAttempts.slice().reverse().map((attempt, index) => {
                        const mode = attempt.challenge_type;
                        const difficulty = attempt.challenge_difficulty;
                        const isSuccessful = attempt.is_successful;
                        const highlightInfo = getRowHighlightInfo(attempt);
                        
                        return (
                          <tr 
                            key={attempt.id || index}
                            className={highlightInfo.shouldHighlight ? 'resultsPageHighlightedRow' : ''}
                          >
                            <td>
                              {index + 1}
                              {highlightInfo.shouldHighlight && (
                                <span className="resultsPageHighlightIndicator">
                                  <span className="resultsPageIndicatorIcon">
                                    <FontAwesomeIcon icon={highlightInfo.icon} />
                                  </span>
                                  <span>{highlightInfo.text}</span>
                                </span>
                              )}
                            </td>
                            <td className="resultsPageModeCell">
                              <span className="resultsPageModeIcon">
                                <FontAwesomeIcon icon={ModeIcons[mode] || faCodeBranch} />
                              </span>
                              <span className="resultsPageModeText">
                                {mode === 'code_fixer' ? 'Code Fixer' :
                                 mode === 'output_tracing' ? 'Output Tracing' :
                                 mode === 'code_completion' ? 'Code Completion' : 'Unknown'}
                              </span>
                            </td>
                            <td>
                              <span 
                                className="resultsPageDifficultyBadge"
                                style={{ backgroundColor: getDifficultyColor(difficulty).background, color: getDifficultyColor(difficulty).color }}
                              >
                                {difficulty || 'Unknown'}
                              </span>
                            </td>
                            <td className="resultsPageResultCell">
                              <span className="resultsPageResultIcon">
                                <FontAwesomeIcon icon={isSuccessful ? faCheck : faTimes} />
                              </span>
                              <span className={`resultsPageResultText ${isSuccessful ? 'resultsPageSuccess' : 'resultsPageFailed'}`}>
                                {isSuccessful ? 'Success' : 'Failed'}
                              </span>
                            </td>
                            <td>{formatTimeSpent(attempt.time_spent, attempt.timer_enabled)}</td>
                            <td>{formatHintsUsed(attempt.hints_used, attempt.hints_enabled)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div className="resultsPageNoResults">
                    <p>No {activeFilter === 'all' ? '' : activeFilter.replace('_', ' ')} attempts found.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="resultsPageScoreSummary">
              <p className="resultsPageScoreText">No challenge attempts found.</p>
            </div>
          )}

          <div className="resultsPageGoBackButtonContainer">
            <button className="resultsPageGoBackButton" onClick={handleGoBack}>
              ← Back to Topics
            </button>
          </div>
        </div>
      </div>
    </ChallengeThemeProvider>
  );
};

export default ResultsPage; 