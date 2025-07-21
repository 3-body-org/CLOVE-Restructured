// ChallengesPage.js
import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';

import { challenges as allChallenges } from 'features/challenges/components/challenges';
import CodeFixer from 'features/challenges/modes/CodeFixer';
import CodeCompletion from 'features/challenges/modes/CodeCompletion';
import OutputTracing from 'features/challenges/modes/OutputTracing';
import ChallengeThemeProvider from 'features/challenges/components/ChallengeThemeProvider';
import styles from 'features/challenges/styles/ChallengesPage.module.scss';
import { validateChallengeConfig, validateChallengeData, handleChallengeError } from 'features/challenges/utils/errorHandling';

// Challenge object structure:
// {
//   id: number (unique identifier like 1, 2, 3...)
//   type: 'CodeFixer' | 'CodeCompletion' | 'OutputTracing'
//   difficulty: 'easy' | 'medium' | 'hard'
//   index: number (position in the array)
//   component: React component to render
//   challengeData: {} (specific data for the challenge)
//   status: 'pending' | 'completed' | 'failed'
//   score: number (points earned)
// }

// Maps challenge types to their React components
const CHALLENGE_COMPONENTS = {
  CodeFixer,
  CodeCompletion,
  OutputTracing,
};

// Default values for new challenges
const DEFAULT_CHALLENGE_CONFIG = {
  status: 'pending',
  score: 0,
};

const ChallengesPage = () => {
  const navigate = useNavigate();
  const { topicId } = useParams();
  const [results, setResults] = useState([]);
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);

  // List of all challenges with their configurations
  const challengeConfigs = useMemo(() => [
    { type: 'CodeFixer', difficulty: 'easy', index: 0 },
    { type: 'CodeCompletion', difficulty: 'easy', index: 0 },
    { type: 'OutputTracing', difficulty: 'easy', index: 0 },
    // To add more challenges, uncomment and modify:
    // { type: 'CodeCompletion', difficulty: 'easy', index: 0 },
  ], []);

  // Map challenge configurations to challenge objects with improved error handling
  const challenges = challengeConfigs.map((config, index) => {
    // Validate challenge configuration
    if (!validateChallengeConfig(config)) {
      console.error(`Invalid challenge config at index ${index}:`, config);
      return null;
    }

    const challengeData = allChallenges[config.type]?.[config.difficulty]?.[config.index];
    
    // Validate challenge data
    const validation = validateChallengeData(challengeData, config.type);
    
    if (!validation.isValid) {
      console.error(`Challenge validation failed for ${config.type}:`, validation.errors);
      const fallbackData = handleChallengeError(
        new Error(validation.errors.join(', ')), 
        config.type, 
        validation.fallbackData
      );
      
      return {
        id: index + 1,
        ...config,
        component: CHALLENGE_COMPONENTS[config.type],
        challengeData: fallbackData,
        ...DEFAULT_CHALLENGE_CONFIG,
        isFallback: true, // Flag to indicate this is fallback data
      };
    }
    
    return {
      id: index + 1, // Auto-generated ID
      ...config, // Spread the config
      component: CHALLENGE_COMPONENTS[config.type], // Get component
      challengeData: challengeData, // Use validated data
      ...DEFAULT_CHALLENGE_CONFIG, // Add default status and score
      isFallback: false,
    };
  }).filter(Boolean); // Remove any null entries

  /**
   * Handles challenge completion
   * @param {number} challengeId - ID of the completed challenge
   * @param {Object} result - Challenge result
   * @param {boolean} result.success - Whether challenge was completed successfully
   * @param {number} result.score - Score achieved
   */
  const handleChallengeComplete = (challengeId, result) => {
    setResults(prev => {
      const updatedResults = [...prev];
      const challengeIndex = challengeId - 1;
      
      updatedResults[challengeIndex] = {
        type: challenges[challengeIndex].type,
        score: result.score,
        status: result.success ? 'completed' : 'failed',
        timestamp: new Date().toISOString(),
      };
      
      return updatedResults;
    });

    // Navigate to deck if last challenge
    if (currentChallengeIndex === challenges.length - 1) {
      navigate(`/my-deck/${topicId}`);
      return;
    }

    // Proceed to next challenge
    setCurrentChallengeIndex(prev => prev + 1);
  };

  // Current challenge being displayed
  const currentChallenge = challenges[currentChallengeIndex];
  const { id, component: ChallengeComponent, challengeData } = currentChallenge || {};

  return (
    <ChallengeThemeProvider>
      <div className={styles.challengesContainer}>
        <div className={styles.challengeWrapper}>
          <div className={styles.fullWidthChallenge}>
            {currentChallenge && (
              <ChallengeComponent
                challenge={challengeData}
                onComplete={(result) => handleChallengeComplete(id, result)}
                isLastChallenge={currentChallengeIndex === challenges.length - 1}
                topicId={topicId}
              />
            )}
          </div>
        </div>
      </div>
    </ChallengeThemeProvider>
  );
};

// No prop types needed for now
export default ChallengesPage;
