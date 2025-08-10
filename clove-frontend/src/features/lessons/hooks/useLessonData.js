import { useState, useEffect, useCallback } from 'react';
import { useLessonService } from '../services/lessonService';

export const useLessonData = (subtopicId) => {
  const [lessonData, setLessonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { getLessonBySubtopicId } = useLessonService();

  const fetchLessonData = useCallback(async () => {
    if (!subtopicId) {
      setError('No subtopic ID provided');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
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
        
        sessionStorage.setItem(cacheKey, JSON.stringify(lessonSections));
      } else {
        setError('No lesson found for this subtopic');
      }
    } catch (err) {
      setError('Failed to load lesson content');
    } finally {
      setLoading(false);
    }
  }, [subtopicId]);

  useEffect(() => {
    fetchLessonData();
  }, [fetchLessonData]);

  const refetch = useCallback(() => {
    const cacheKey = `lesson_${subtopicId}`;
    sessionStorage.removeItem(cacheKey);
    fetchLessonData();
  }, [fetchLessonData, subtopicId]);

  const clearCache = useCallback(() => {
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