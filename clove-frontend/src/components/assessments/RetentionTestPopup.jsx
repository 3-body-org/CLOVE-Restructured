import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import RetentionTestAvailability from './RetentionTestAvailability';
import AssessmentInstructions from './AssessmentInstructions';
import './styles/RetentionTestPopup.scss';

const RetentionTestPopup = ({ topicId, isOpen, onClose, showResults = false }) => {
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [selectedStage, setSelectedStage] = useState(null);
  const { get } = useApi();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && topicId) {
      fetchAvailability();
    }
  }, [isOpen, topicId]);

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

  const handleStartTest = (stage, action = 'start') => {
    setSelectedStage(stage);
    if (action === 'results') {
      // Navigate directly to results
      navigate(`/my-deck/${topicId}/retention-test/result?stage=${stage}`);
      onClose();
    } else {
      // Show instructions for starting test
      setShowInstructions(true);
    }
  };

  const handleProceedToTest = () => {
    setShowInstructions(false);
    navigate(`/my-deck/${topicId}/retention-test?stage=${selectedStage}`);
    onClose();
  };

  const handleCloseInstructions = () => {
    setShowInstructions(false);
    setSelectedStage(null);
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="retention-test-popup-overlay">
        <div className="retention-test-popup">
          <div className="retention-test-popup__header">
            <h2>Retention Tests</h2>
            <button 
              className="retention-test-popup__close"
              onClick={handleClose}
              aria-label="Close"
            >
              ×
            </button>
          </div>
          
          <div className="retention-test-popup__content">
            {loading ? (
              <div className="retention-test-popup__loading">
                <div className="spinner"></div>
                <span>Loading retention test information...</span>
              </div>
            ) : error ? (
              <div className="retention-test-popup__error">
                <span>⚠️ {error}</span>
                <button 
                  className="btn btn--secondary"
                  onClick={fetchAvailability}
                >
                  Try Again
                </button>
              </div>
            ) : (
              <RetentionTestAvailability 
                topicId={topicId}
                onStartTest={handleStartTest}
                showResultsOnly={showResults}
              />
            )}
          </div>
        </div>
      </div>

      {/* Retention Test Instructions Modal */}
      {showInstructions && (
        <AssessmentInstructions
          isVisible={showInstructions}
          onClose={handleCloseInstructions}
          onStart={handleProceedToTest}
          assessmentType="retention-test"
          topicId={topicId}
          stage={selectedStage}
        />
      )}
    </>
  );
};

export default RetentionTestPopup;
