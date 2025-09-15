import React, { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import styles from "features/landing/styles/ImageCarousel.module.scss";

// Import the 3 specific GIFs for the carousel
import wizardGif from "assets/GIF/landing/gif-wizardsubtopics.gif";
import detectiveGif from "assets/GIF/landing/gif-detectivesubtopics.gif";
import spaceGif from "assets/GIF/landing/gif-spacesubtopics.gif";

const carouselData = [
  {
    id: 1,
    theme: 'wizard',
    image: wizardGif,
    title: 'Wizard Academy',
    description: 'Master Java spells in an arcane learning environment with magical coding challenges',
    color: '#fbbf24', // Gold for wizard theme
    dotColor: '#fbbf24',
    transition: 'magical-sparkle'
  },
  {
    id: 2,
    theme: 'detective',
    image: detectiveGif,
    title: 'Noir Investigations',
    description: 'Solve coding mysteries in a classic detective setting with immersive storytelling',
    color: '#374151', // Dark gray for detective theme
    dotColor: '#374151',
    transition: 'film-reel'
  },
  {
    id: 3,
    theme: 'space',
    image: spaceGif,
    title: 'Space Exploration',
    description: 'Navigate through cosmic coding challenges in a futuristic space environment',
    color: '#3b82f6', // Blue for space theme
    dotColor: '#3b82f6',
    transition: 'digital-glitch'
  }
];

export default function ImageCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [transitionDirection, setTransitionDirection] = useState('next');

  const nextSlide = useCallback(() => {
    setTransitionDirection('next');
    setCurrentIndex((prev) => (prev + 1) % carouselData.length);
  }, []);

  const prevSlide = useCallback(() => {
    setTransitionDirection('prev');
    setCurrentIndex((prev) => (prev - 1 + carouselData.length) % carouselData.length);
  }, []);

  const goToSlide = (index) => {
    setTransitionDirection(index > currentIndex ? 'next' : 'prev');
    setCurrentIndex(index);
  };

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(nextSlide, 6000); // Increased to 6 seconds for GIFs
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  return (
    <div 
      className={styles.carouselContainer}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Main Image Container */}
      <div className={styles.imageContainer}>
        <div className={`${styles.carouselImage} ${styles[carouselData[currentIndex].transition]}`}>
          <img 
            src={carouselData[currentIndex].image} 
            alt={carouselData[currentIndex].title}
            className={styles.gifImage}
          />
        </div>
        
        {/* Theme-specific overlay */}
        <div className={`${styles.themeOverlay} ${styles[`${carouselData[currentIndex].theme}Overlay`]}`} />
        
        {/* Description overlay */}
        <div className={styles.descriptionOverlay}>
          <h3 className={styles.imageTitle}>{carouselData[currentIndex].title}</h3>
          <p className={styles.imageDescription}>{carouselData[currentIndex].description}</p>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button 
        className={`${styles.navButton} ${styles.prevButton}`}
        onClick={prevSlide}
        aria-label="Previous image"
      >
        <FontAwesomeIcon icon={faChevronLeft} />
      </button>
      
      <button 
        className={`${styles.navButton} ${styles.nextButton}`}
        onClick={nextSlide}
        aria-label="Next image"
      >
        <FontAwesomeIcon icon={faChevronRight} />
      </button>

      {/* Dot Indicators */}
      <div className={styles.dotContainer}>
        {carouselData.map((item, index) => (
          <button
            key={item.id}
            className={`${styles.dot} ${index === currentIndex ? styles.activeDot : ''}`}
            onClick={() => goToSlide(index)}
            style={{ 
              '--dot-color': item.dotColor,
              '--dot-active-color': item.dotColor 
            }}
            aria-label={`Go to ${item.title}`}
          />
        ))}
      </div>
    </div>
  );
} 