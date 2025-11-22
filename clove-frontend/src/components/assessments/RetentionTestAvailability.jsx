import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import CountdownTimer from '../common/CountdownTimer';
import './styles/RetentionTestAvailability.scss';

const RetentionTestAvailability = ({ topicId, onStartTest, showResultsOnly = false }) => {
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { get } = useApi();

  useEffect(() => {
    fetchAvailability();
  }, [topicId]);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const response = await get(`/assessment_questions/topic/${topicId}/retention-test/availability`);
      
      if (response.ok) {
        const data = await response.json();
        setAvailability(data);
        setError(null);
      } else {
        setError('Failed to load retention test availability');
      }
    } catch (err) {
      setError('Error loading retention test availability');
      console.error('Error fetching retention test availability:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateTargetTime = (hoursSinceCompletion, requiredMinutes) => {
    const now = new Date();
    const completionTime = new Date(availability.completed_at);
    const targetTime = new Date(completionTime.getTime() + (requiredMinutes * 60 * 1000));
    return targetTime.toISOString();
  };

  if (loading) {
    return (
      <div className="retention-test-availability">
        <div className="retention-test-availability__loading">
          <div className="spinner"></div>
          <span>Loading retention test availability...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="retention-test-availability">
        <div className="retention-test-availability__error">
          <span>⚠️ {error}</span>
        </div>
      </div>
    );
  }

  if (!availability) {
    return null;
  }

  const { 
    first_stage_available, 
    second_stage_available, 
    first_stage_completed, 
    second_stage_completed,
    first_stage_countdown,
    second_stage_countdown,
    completed_at 
  } = availability;

  return (
    <div className="retention-test-availability">
      <div className="retention-test-availability__header">
        <h3>{showResultsOnly ? 'Retention Test Overview' : 'Retention Tests'}</h3>
        <p>{showResultsOnly ? 'View your progress and upcoming retention tests' : 'Test your knowledge retention at different intervals'}</p>
      </div>

      {/* Progress Indicator */}
      {showResultsOnly && (
        <div className="retention-test-availability__progress">
          <div className="progress-bar">
            <div 
              className="progress-bar__fill"
              style={{ 
                width: `${((first_stage_completed ? 1 : 0) + (second_stage_completed ? 1 : 0)) * 50}%` 
              }}
            ></div>
          </div>
          <div className="progress-text">
            {first_stage_completed && second_stage_completed 
              ? 'All retention tests completed! 🎉'
              : `${first_stage_completed ? 1 : 0} of 2 retention tests completed`
            }
          </div>
        </div>
      )}

      <div className="retention-test-availability__stages">
        {/* First Stage (10 hours) - Always show both stages when viewing results */}
        <div className={`retention-test-stage ${first_stage_completed ? 'completed' : ''}`}>
          <div className="retention-test-stage__header">
            <div className="retention-test-stage__title">
              <span className="retention-test-stage__number">1</span>
              <div>
                <h4>First Retention Test</h4>
                <p>Available after 10 hours</p>
              </div>
            </div>
            <div className="retention-test-stage__status">
              {first_stage_completed ? (
                <div className="retention-test-stage__actions">
                  <span className="status-badge status-badge--completed">✓ Completed</span>
                  <button 
                    className="btn btn--secondary btn--small"
                    onClick={() => onStartTest(1, 'results')}
                  >
                    View Results
                  </button>
                </div>
              ) : first_stage_available ? (
                <button 
                  className="btn btn--primary btn--small"
                  onClick={() => onStartTest(1)}
                >
                  Start Test
                </button>
              ) : (
                <span className="status-badge status-badge--pending">Pending</span>
              )}
            </div>
          </div>
          
          {!first_stage_completed && !first_stage_available && first_stage_countdown && (
            <div className="retention-test-stage__countdown">
              <p>Available in:</p>
              <CountdownTimer
                targetTime={calculateTargetTime(availability.hours_since_completion, 1)}
                size="small"
                showDays={false}
              />
            </div>
          )}
        </div>

        {/* Second Stage (5 days) - Always show both stages when viewing results */}
        <div className={`retention-test-stage ${second_stage_completed ? 'completed' : ''}`}>
          <div className="retention-test-stage__header">
            <div className="retention-test-stage__title">
              <span className="retention-test-stage__number">2</span>
              <div>
                <h4>Second Retention Test</h4>
                <p>Available after 1.5 days</p>
              </div>
            </div>
            <div className="retention-test-stage__status">
              {second_stage_completed ? (
                <div className="retention-test-stage__actions">
                  <span className="status-badge status-badge--completed">✓ Completed</span>
                  <button 
                    className="btn btn--secondary btn--small"
                    onClick={() => onStartTest(2, 'results')}
                  >
                    View Results
                  </button>
                </div>
              ) : second_stage_available ? (
                <button 
                  className="btn btn--primary btn--small"
                  onClick={() => onStartTest(2)}
                >
                  Start Test
                </button>
              ) : (
                <span className="status-badge status-badge--pending">Pending</span>
              )}
            </div>
          </div>
          
          {!second_stage_completed && !second_stage_available && second_stage_countdown && (
            <div className="retention-test-stage__countdown">
              <p>Available in:</p>
              <CountdownTimer
                targetTime={calculateTargetTime(availability.hours_since_completion, 5)}
                size="small"
                showDays={false}
              />
            </div>
          )}
        </div>
      </div>

      {completed_at && (
        <div className="retention-test-availability__info">
          <p>Topic completed on: {new Date(completed_at).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
};

export default RetentionTestAvailability;
