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
import styles from '../styles/Results.module.scss';

// Icons for different challenge modes
const ModeIcons = {
  code_fixer: '🔧',
  output_tracing: '🔍',
  code_completion: '</>'
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
  const { topicId: contextTopicId, subtopicId: contextSubtopicId } = useContext(MyDeckContext);
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
        console.error('Error fetching challenge results:', err);
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
      console.log('🔄 RESETTING: Challenge fields for navigation/refresh protection');
      const response = await post(`/user_challenges/reset-challenge-fields/user/${currentUser.id}/subtopic/${subtopicId}`);
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ RESET SUCCESS:', result.message);
      } else {
        console.warn('⚠️ RESET WARNING: Could not reset challenge fields');
        // Reset flag if failed
        setHasResetFields(false);
      }
    } catch (error) {
      console.error('❌ RESET ERROR:', error);
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
    
    // Debug logging for highlighted rows
    if (isCancelled || isTimeExpired) {
      console.log('🎯 HIGHLIGHTING ROW:', {
        attemptId: attempt.id,
        isCancelled,
        isTimeExpired,
        wasCancelled: attempt.was_cancelled,
        timerEnabled: attempt.timer_enabled,
        timeSpent: attempt.time_spent,
        timeLimit,
        difficulty: attempt.challenge_difficulty
      });
    }
    
    if (isCancelled) {
      return {
        shouldHighlight: true,
        reason: 'cancelled',
        icon: '⏹️',
        text: 'Cancelled'
      };
    }
    
    if (isTimeExpired) {
      return {
        shouldHighlight: true,
        reason: 'timeout',
        icon: '⏰',
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
      // Reset challenge fields before going back to lesson
      await resetChallengeFields();
    } catch (error) {
      console.error('❌ RESET ERROR:', error);
      // Continue anyway - don't block the user from going back
    }
    
    // Navigate back to lesson page
    navigate(`/lesson/${topicId}/${subtopicId}`);
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
      <div className={styles.resultsPageContainer}>
        <div className={styles.resultsSummary}>
          <h2 className={styles.resultsTitle}>Challenge Results</h2>
          <p className={styles.resultsDescription}>
            Here's how you performed on your challenges:
          </p>

          {attempts.length > 0 ? (
            <div className={styles.resultsContainer} style={themeStyles}>
              {/* Filter Tabs */}
              <div className={styles.filterTabs}>
                <button
                  className={`${styles.filterTab} ${activeFilter === 'all' ? styles.active : ''}`}
                  onClick={() => setActiveFilter('all')}
                >
                  All ({getFilterCount('all')})
                </button>
                
                {availableModes.includes('code_fixer') && (
                  <button
                    className={`${styles.filterTab} ${activeFilter === 'code_fixer' ? styles.active : ''}`}
                    onClick={() => setActiveFilter('code_fixer')}
                  >
                    Code Fixer ({getFilterCount('code_fixer')})
                  </button>
                )}
                
                {availableModes.includes('output_tracing') && (
                  <button
                    className={`${styles.filterTab} ${activeFilter === 'output_tracing' ? styles.active : ''}`}
                    onClick={() => setActiveFilter('output_tracing')}
                  >
                    Output Tracing ({getFilterCount('output_tracing')})
                  </button>
                )}
                
                {availableModes.includes('code_completion') && (
                  <button
                    className={`${styles.filterTab} ${activeFilter === 'code_completion' ? styles.active : ''}`}
                    onClick={() => setActiveFilter('code_completion')}
                  >
                    Code Completion ({getFilterCount('code_completion')})
                  </button>
                )}
                
                <button
                  className={`${styles.filterTab} ${activeFilter === 'successful' ? styles.active : ''}`}
                  onClick={() => setActiveFilter('successful')}
                >
                  Successful ({getFilterCount('successful')})
                </button>
                
                <button
                  className={`${styles.filterTab} ${activeFilter === 'needs_work' ? styles.active : ''}`}
                  onClick={() => setActiveFilter('needs_work')}
                >
                  Needs Work ({getFilterCount('needs_work')})
                </button>
          </div>

              {/* Results Table */}
              <div className={styles.tableContainer}>
                {filteredAttempts.length > 0 ? (
                  <table className={styles.resultsTable}>
                    <thead>
                      <tr>
                        <th>Challenge</th>
                        <th>Game Mode</th>
                        <th>Difficulty</th>
                        <th>Result</th>
                        <th>Time Spent</th>
                        <th>Hints Used</th>
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
                            className={highlightInfo.shouldHighlight ? styles.highlightedRow : ''}
                          >
                            <td>
                              {index + 1}
                              {highlightInfo.shouldHighlight && (
                                <span className={styles.highlightIndicator}>
                                  <span className={styles.indicatorIcon}>{highlightInfo.icon}</span>
                                  <span>{highlightInfo.text}</span>
                                </span>
                              )}
                            </td>
                            <td className={styles.modeCell}>
                              <span className={styles.modeIcon}>{ModeIcons[mode] || '❓'}</span>
                              <span className={styles.modeText}>
                                {mode === 'code_fixer' ? 'Code Fixer' :
                                 mode === 'output_tracing' ? 'Output Tracing' :
                                 mode === 'code_completion' ? 'Code Completion' : 'Unknown'}
                              </span>
                            </td>
                            <td>
                              <span 
                                className={styles.difficultyBadge}
                                style={{ backgroundColor: getDifficultyColor(difficulty).background, color: getDifficultyColor(difficulty).color }}
                              >
                                {difficulty || 'Unknown'}
                              </span>
                            </td>
                            <td className={styles.resultCell}>
                              <span className={styles.resultIcon}>
                                {isSuccessful ? '✅' : '❌'}
                              </span>
                              <span className={`${styles.resultText} ${isSuccessful ? styles.success : styles.failed}`}>
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
                  <div className={styles.noResults}>
                    <p>No {activeFilter === 'all' ? '' : activeFilter.replace('_', ' ')} attempts found.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className={styles.scoreSummary}>
              <p className={styles.scoreText}>No challenge attempts found.</p>
            </div>
          )}

          <div className={styles.goBackButtonContainer}>
            <button className={styles.goBackButton} onClick={handleGoBack}>
              ← Back to Lesson
            </button>
          </div>
        </div>
      </div>
    </ChallengeThemeProvider>
  );
};

export default ResultsPage; 