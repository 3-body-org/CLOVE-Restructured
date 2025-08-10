import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { MyDeckContext } from "../../contexts/MyDeckContext";
import LoadingScreen from "../layout/StatusScreen/LoadingScreen";

/**
 * ProtectedTopicRoute component that checks if a topic is unlocked before rendering.
 * Redirects to dashboard if the topic is locked.
 */
const ProtectedTopicRoute = ({ children }) => {
  const navigate = useNavigate();
  const { topicId: urlTopicId } = useParams();
  const { loadTopicOverview, topicOverview, unlockStatus, overviewLoading } = useContext(MyDeckContext);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkTopicAccess = async () => {
      if (!urlTopicId) {
        setIsChecking(false);
        return;
      }

      try {
        // Load topic overview to get unlock status
        await loadTopicOverview(parseInt(urlTopicId));
        
        if (mounted) {
          setIsChecking(false);
        }
      } catch (error) {
        if (mounted) {
          // If we can't load the topic, assume it's locked
          toast.error("Topic not available. Redirecting to dashboard.");
          navigate("/dashboard", { replace: true });
        }
      }
    };

    checkTopicAccess();

    return () => {
      mounted = false;
    };
  }, [urlTopicId, loadTopicOverview, navigate, overviewLoading]);

  // Handle redirect when topic is locked
  useEffect(() => {
    if (!isChecking && !overviewLoading && topicOverview && topicOverview.topicId === parseInt(urlTopicId)) {
      const isTopicUnlocked = topicOverview.is_unlocked;
      
      if (isTopicUnlocked === false) {
        toast.error("This topic is not unlocked yet. Complete previous topics to unlock this one.");
        navigate("/dashboard", { replace: true });
      }
    }
  }, [isChecking, overviewLoading, topicOverview, urlTopicId, navigate]);

  // Show loading while checking access or loading overview
  if (isChecking || overviewLoading || !topicOverview || topicOverview.topicId !== parseInt(urlTopicId)) {
    return <LoadingScreen message="Checking topic access..." />;
  }

  // Topic is unlocked, render the children
  return children;
};

export default ProtectedTopicRoute; 