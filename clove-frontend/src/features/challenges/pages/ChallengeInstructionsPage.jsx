/**
 * @file ChallengeInstructionsPage.jsx
 * @description Instructions page that appears before challenges, explaining layout and mechanics
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useChallengeTheme } from '../hooks/useChallengeTheme';
import ChallengeThemeProvider from '../components/ChallengeThemeProvider';
import LoadingScreen from '../../../components/layout/StatusScreen/LoadingScreen';
import ErrorScreen from '../../../components/layout/StatusScreen/ErrorScreen';
import styles from '../styles/ChallengeInstructionsPage.module.scss';

const ChallengeInstructionsPage = () => {
  const navigate = useNavigate();
  const { topicId, subtopicId } = useParams();
  const { user: currentUser } = useAuth();
  const { getThemeStyles, currentTheme } = useChallengeTheme();
  
  const [minTimePassed, setMinTimePassed] = useState(false);

  // Minimum loading time effect
  useEffect(() => {
    setMinTimePassed(false);
    const timer = setTimeout(() => setMinTimePassed(true), 200);
    return () => clearTimeout(timer);
  }, []);

  // Get theme styles
  const themeStyles = useMemo(() => getThemeStyles(), [getThemeStyles]);

  // Handle navigation to challenges
  const handleStartChallenges = () => {
    navigate(`/lesson/${topicId}/${subtopicId}/challenges`);
  };

  // Handle back navigation
  const handleBackToPractice = () => {
    navigate(`/lesson/${topicId}/${subtopicId}/practice`);
  };

  // Loading state
  if (!currentUser || !minTimePassed) {
    return <LoadingScreen message="Loading challenge instructions..." />;
  }

  return (
    <ChallengeThemeProvider>
      <div className={styles.container} style={themeStyles}>
        <div className={styles.content}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>🎯 Challenge Instructions</h1>
          <p className={styles.subtitle}>
            Learn about the challenge layout and important rules before you begin
          </p>
        </div>

        {/* Challenge Layout Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>📋 Challenge Layout</h2>
          <div className={styles.layoutGrid}>
            {/* Left Sidebar */}
            <div className={styles.layoutItem}>
              <div className={styles.layoutIcon}>📱</div>
              <h3>Left Sidebar</h3>
              <div className={styles.layoutDetails}>
                <div className={styles.detailItem}>
                  <span className={styles.detailIcon}>🎯</span>
                  <div>
                    <strong>Challenge Mode:</strong> Shows the type of challenge you're facing
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailIcon}>📖</span>
                  <div>
                    <strong>Scenario:</strong> Provides context and explains what you need to accomplish
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailIcon}>⏰</span>
                  <div>
                    <strong>Timer:</strong> Countdown showing remaining time (if enabled)
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailIcon}>💡</span>
                  <div>
                    <strong>Hints:</strong> Available hints to help you solve the challenge
                  </div>
                </div>
              </div>
            </div>

            {/* Right Challenge Area */}
            <div className={styles.layoutItem}>
              <div className={styles.layoutIcon}>💻</div>
              <h3>Right Challenge Area</h3>
              <div className={styles.layoutDetails}>
                <div className={styles.detailItem}>
                  <span className={styles.detailIcon}>📊</span>
                  <div>
                    <strong>Progress:</strong> Shows your current position in the challenge sequence
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailIcon}>⌨️</span>
                  <div>
                    <strong>Code Editor:</strong> Where you'll fix, trace, or complete the code
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailIcon}>🔍</span>
                  <div>
                    <strong>Expected Output:</strong> See the expected output of the code
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailIcon}>✅</span>
                  <div>
                    <strong>Submit Button:</strong> Submit your answer when ready
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Challenge Modes Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>🎮 Challenge Modes</h2>
          <div className={styles.modesGrid}>
            <div className={styles.modeCard}>
              <div className={styles.modeIcon}>🔧</div>
              <h3>Code Fixer</h3>
              <p>Find and fix bugs in existing code to make it work correctly</p>
            </div>
            <div className={styles.modeCard}>
              <div className={styles.modeIcon}>🧩</div>
              <h3>Code Completion</h3>
              <p>Complete missing parts of code by selecting from available options</p>
            </div>
            <div className={styles.modeCard}>
              <div className={styles.modeIcon}>🔍</div>
              <h3>Output Tracing</h3>
              <p>Trace through code execution and predict the output</p>
            </div>
          </div>
        </div>

        {/* Important Rules Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>⚠️ Important Rules</h2>
          <div className={styles.rulesList}>
            <div className={styles.ruleItem}>
              <div className={styles.ruleIcon}>🚫</div>
              <div className={styles.ruleContent}>
                <h4>No Leaving During Challenges</h4>
                <p>If you leave the page or navigate away during a challenge, it will be counted as <strong>WRONG</strong> regardless of your answer.</p>
              </div>
            </div>
            <div className={styles.ruleItem}>
              <div className={styles.ruleIcon}>⏰</div>
              <div className={styles.ruleContent}>
                <h4>Time Limit Rules</h4>
                <p>If your time runs out, your answer will be counted as <strong>WRONG</strong> regardless of what you submit.</p>
              </div>
            </div>
            <div className={styles.ruleItem}>
              <div className={styles.ruleIcon}>💾</div>
              <div className={styles.ruleContent}>
                <h4>Progress Saving</h4>
                <p>Your progress is automatically saved as you work, but leaving early will still count as a wrong answer.</p>
              </div>
            </div>
            <div className={styles.ruleItem}>
              <div className={styles.ruleIcon}>🔄</div>
              <div className={styles.ruleContent}>
                <h4>Multiple Attempts</h4>
                <p>You can attempt challenges multiple times, but each attempt counts toward your overall performance.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>💡 Pro Tips</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>⏱️</span>
              <p>Depending on your perfomance, it may showed up. Manage your time wisely - don't spend too long on any single part</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>💡</span>
              <p>Depending on your perfomance, it may be provided. Use hints strategically - they're there to help, not to solve for you</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🔍</span>
              <p>Read the scenario carefully - it contains important clues about what to do</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✅</span>
              <p>Test your code before submitting - make sure it works as expected</p>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className={styles.navigation}>
          <button 
            className={styles.backButton}
            onClick={handleBackToPractice}
          >
            ← Back to Practice
          </button>
          <button 
            className={styles.startButton}
            onClick={handleStartChallenges}
          >
            🚀 Start Challenges
          </button>
        </div>
        </div>
      </div>
    </ChallengeThemeProvider>
  );
};

export default ChallengeInstructionsPage;
