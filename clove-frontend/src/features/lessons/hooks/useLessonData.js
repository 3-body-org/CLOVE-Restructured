import { useState, useEffect, useCallback } from 'react';
import { useLessonService } from '../services/lessonService';

export const useLessonData = (subtopicId) => {
  const [lessonData, setLessonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { getLessonBySubtopicId } = useLessonService();

  const fetchLessonData = useCallback(async () => {
    if (!subtopicId) {
      console.error('❌ [useLessonData] No subtopic ID provided');
      setError('No subtopic ID provided');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Check cache first
      const cacheKey = `lesson_${subtopicId}`;
      const cachedData = sessionStorage.getItem(cacheKey);
      
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        setLessonData(parsedData);
        setLoading(false);
        return;
      }
      
      const lesson = await getLessonBySubtopicId(subtopicId);
      if (lesson) {
        const lessonSections = lesson.lessonSections || [];
        setLessonData(lessonSections);
        
        // Cache the lesson data for this session
        sessionStorage.setItem(cacheKey, JSON.stringify(lessonSections));
      } else {
        console.error('❌ [useLessonData] No lesson found for subtopicId:', subtopicId);
        setError('No lesson found for this subtopic');
      }
    } catch (err) {
      console.error('❌ [useLessonData] Error fetching lesson:', err);
      setError('Failed to load lesson content');
    } finally {
      setLoading(false);
    }
  }, [subtopicId]); // Removed getLessonBySubtopicId to prevent infinite loops

  useEffect(() => {
    fetchLessonData();
  }, [fetchLessonData]);

  const refetch = useCallback(() => {
    // Clear cache and fetch fresh data
    const cacheKey = `lesson_${subtopicId}`;
    sessionStorage.removeItem(cacheKey);
    fetchLessonData();
  }, [fetchLessonData, subtopicId]);

  // Cleanup function to clear old cache data
  const clearCache = useCallback(() => {
    // Clear all lesson cache entries
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('lesson_')) {
        sessionStorage.removeItem(key);
      }
    });
  }, []);

  return {
    lessonData,
    loading,
    error,
    refetch,
    clearCache
  };
}; 