import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from 'contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useJoyride } from 'contexts/JoyrideContext';
import WelcomeScreen from './components/WelcomeScreen';
import CharacterCreation from './components/CharacterCreation';
import RealmSelection from './components/RealmSelection';
import RealmIntroduction from './components/RealmIntroduction';
import './styles/OnboardingFlow.scss';

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

const OnboardingFlow = ({ onComplete }) => {
  const authContext = useAuth();
  // Handle case where context might not be fully initialized yet
  if (!authContext) {
    return null; // Or a loading spinner
  }
  const { user, updateUser, makeAuthenticatedRequest, isLoading, refreshUser } = authContext;
  const navigate = useNavigate();
  const { startTour } = useJoyride();
  const [currentStep, setCurrentStep] = useState('welcome');
  const [onboardingData, setOnboardingData] = useState({});
  const [isCompleting, setIsCompleting] = useState(false);

  // Double-check: if user already completed, redirect immediately
  useEffect(() => {
    if (user?.onboarding_completed) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // Load saved progress from localStorage on mount
  useEffect(() => {
    const savedProgress = localStorage.getItem('onboarding_progress');
    if (savedProgress && !user?.onboarding_completed) {
      try {
        const { step, data } = JSON.parse(savedProgress);
        setCurrentStep(step);
        setOnboardingData(data);
      } catch (e) {
        console.error('Failed to restore onboarding progress:', e);
      }
    }
  }, [user]);

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    if (!user?.onboarding_completed && currentStep !== 'welcome') {
      // Filter out non-serializable data (React elements, DOM nodes, etc.)
      // Only copy primitive values and known safe properties
      const serializableData = {
        name: onboardingData.name,
        class: onboardingData.class,
        selectedRealm: typeof onboardingData.selectedRealm === 'string' 
          ? onboardingData.selectedRealm 
          : onboardingData.selectedRealm?.id,
        // If realmData exists, only save serializable properties
        realmData: onboardingData.realmData && typeof onboardingData.realmData === 'object' ? {
          id: onboardingData.realmData.id,
          name: onboardingData.realmData.name,
          description: onboardingData.realmData.description,
          story: onboardingData.realmData.story,
          mentor: onboardingData.realmData.mentor,
          difficulty: onboardingData.realmData.difficulty,
          theme: onboardingData.realmData.theme,
          color: onboardingData.realmData.color,
          bgGradient: onboardingData.realmData.bgGradient,
          features: Array.isArray(onboardingData.realmData.features) 
            ? onboardingData.realmData.features 
            : undefined
          // Exclude 'preview' which contains React elements
        } : undefined,
        // If classData exists, only save serializable properties
        classData: onboardingData.classData && typeof onboardingData.classData === 'object' ? {
          id: onboardingData.classData.id,
          name: onboardingData.classData.name,
          description: onboardingData.classData.description,
          icon: onboardingData.classData.icon,
          abilities: Array.isArray(onboardingData.classData.abilities)
            ? onboardingData.classData.abilities
            : undefined,
          color: onboardingData.classData.color,
          bgGradient: onboardingData.classData.bgGradient
        } : undefined
      };
      
      try {
        localStorage.setItem('onboarding_progress', JSON.stringify({
          step: currentStep,
          data: serializableData
        }));
      } catch (e) {
        console.error('Failed to save onboarding progress:', e);
      }
    }
  }, [currentStep, onboardingData, user]);

  // Add exit confirmation to prevent accidental navigation away
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!user?.onboarding_completed && currentStep !== 'welcome') {
        e.preventDefault();
        e.returnValue = 'You have unsaved progress. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [user, currentStep]);

  const steps = [
    { id: 'welcome', component: WelcomeScreen, title: 'Welcome' },
    { id: 'character-creation', component: CharacterCreation, title: 'Who Are You?' },
    { id: 'realm-selection', component: RealmSelection, title: 'Where to Start?' },
    { id: 'realm-introduction', component: RealmIntroduction, title: 'Realm Introduction' }
  ];

  const handleNext = async (data = {}) => {
    const newData = { ...onboardingData, ...data };
    setOnboardingData(newData);

    const currentIndex = steps.findIndex(step => step.id === currentStep);
    const nextStep = steps[currentIndex + 1];

    if (nextStep) {
      setCurrentStep(nextStep.id);
    } else {
      // Complete onboarding
      await completeOnboarding(newData);
    }
  };

  const handleBack = () => {
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    const prevStep = steps[currentIndex - 1];

    if (prevStep) {
      setCurrentStep(prevStep.id);
    }
  };

  const completeOnboarding = async (data) => {
    if (isCompleting) return; // Prevent double submission
    
    setIsCompleting(true);
    
    const handleOnboardingCompletion = (updatedUser) => {
      // Clear localStorage progress
      localStorage.removeItem('onboarding_progress');
      // Ensure onboarding_completed is set to true
      const finalUserData = {
        ...updatedUser,
        onboarding_completed: true
      };
      updateUser(finalUserData);
      setIsCompleting(false);
      if (onComplete && typeof onComplete === 'function') {
        onComplete(finalUserData);
      } else {
        navigate('/dashboard');
      }
      // Start joyride tour after a short delay to ensure page is loaded
      setTimeout(() => {
        startTour();
      }, 1000);
    };

    const updatedUser = {
      id: user?.id,
      username: data.name,
      email: user?.email,
      first_name: user?.first_name,
      last_name: user?.last_name,
      onboarding_completed: true,
      traveler_class: data.class,
      selected_realm: data.selectedRealm,
      current_realm: data.selectedRealm,
      story_progress: {
        current_step: 'realm_introduction_completed',
        completed_steps: ['welcome', 'character_creation', 'realm_selection', 'realm_introduction'],
        character_data: {
          name: data.name,
          class: data.class,
          selectedRealm: data.selectedRealm
        }
      }
    };

    const MAX_RETRIES = 3;
    let attempts = 0;
    let success = false;

    while (attempts < MAX_RETRIES && !success) {
      try {
        attempts++;
        const response = await makeAuthenticatedRequest(
          `${API_BASE}/api/users/onboarding`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              onboarding_completed: true,
              traveler_name: data.name,
              traveler_class: data.class,
              selected_realm: data.selectedRealm,
              current_realm: data.selectedRealm,
              story_progress: {
                current_step: 'realm_introduction_completed',
                completed_steps: ['welcome', 'character_creation', 'realm_selection', 'realm_introduction'],
                character_data: {
                  name: data.name,
                  class: data.class,
                  selectedRealm: data.selectedRealm
                }
              }
            })
          }
        );
        
        if (response.ok) {
          const responseData = await response.json();
          success = true;
          
          // Use the user data from API response (most up-to-date)
          if (responseData.user) {
            // Update user immediately with response data
            updateUser(responseData.user);
            
            // Wait a moment for state to update
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Refresh user data from backend to ensure consistency
            await refreshUser();
            
            // Wait again for refresh to complete
            await new Promise(resolve => setTimeout(resolve, 100));
            
            handleOnboardingCompletion(responseData.user);
          } else {
            // Fallback: refresh and use updated user
            await refreshUser();
            await new Promise(resolve => setTimeout(resolve, 200));
            // Ensure onboarding_completed is true in fallback
            const finalUser = {
              ...updatedUser,
              onboarding_completed: true
            };
            handleOnboardingCompletion(finalUser);
          }
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error(`Onboarding API returned error status ${response.status}:`, errorData);
          throw new Error(`API returned status ${response.status}`);
        }
      } catch (error) {
        console.error(`Onboarding attempt ${attempts} failed:`, error);
        if (attempts >= MAX_RETRIES) {
          console.error('All onboarding completion attempts failed');
          alert('Failed to save your progress. Please try again or contact support.');
          setIsCompleting(false);
          return;
        }
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
      }
    }
  };

  const renderCurrentStep = () => {
    const step = steps.find(s => s.id === currentStep);
    if (!step) return null;

    const Component = step.component;
    const stepProps = {
      onNext: handleNext,
      onBack: handleBack,
      characterData: onboardingData,
      realmData: onboardingData.selectedRealm ? onboardingData.selectedRealm : null,
      ...onboardingData
    };

    return (
      <div
        key={currentStep}
        className="step-container"
      >
        <Component {...stepProps} />
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="onboarding-loading">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <h2>Preparing Your Journey...</h2>
          <p>Setting up your adventure in the realms of code</p>
        </div>
      </div>
    );
  }

  if (isCompleting) {
    return (
      <div className="onboarding-loading">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <h2>Completing Your Journey Setup...</h2>
          <p>Saving your adventure preferences</p>
        </div>
      </div>
    );
  }

  return (
    <div className="onboarding-flow">
      <div className="onboarding-header">
        <div className="progress-indicator">
          {steps.map((step, index) => {
            const stepIndex = steps.findIndex(s => s.id === currentStep);
            const isCompleted = index < stepIndex;
            const isCurrent = index === stepIndex;
            
            return (
              <div
                key={step.id}
                className={`progress-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
              >
                <div className="step-number">
                  {isCompleted ? '✓' : index + 1}
                </div>
                <div className="step-title">{step.title}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="onboarding-content">
        <AnimatePresence mode="wait">
          {renderCurrentStep()}
        </AnimatePresence>
      </div>

    </div>
  );
};

export default OnboardingFlow;
