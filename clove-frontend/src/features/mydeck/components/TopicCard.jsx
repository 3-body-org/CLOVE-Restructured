/**
 * @file TopicCard.jsx
 * @description Renders a topic card with progress, lock state, and theme-aware styles.
 */

import React from "react";
import PropTypes from "prop-types";
import { Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import styles from "features/mydeck/styles/TopicCard.module.scss";

/**
 * Render themed SVG background based on topic theme
 */
const renderThemeBackground = (themeName, topicId) => {
  const uniqueId = `topic-card-${topicId}`;
  
  if (themeName === 'wizard') {
    return (
      <svg className={styles.themeSvg} viewBox="0 0 320 240" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={`wizardSky-${uniqueId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1a2e26" />
            <stop offset="50%" stopColor="#0d1a14" />
            <stop offset="100%" stopColor="#050a08" />
          </linearGradient>
          <radialGradient id={`magicGlow-${uniqueId}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#6EE7B7" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#6EE7B7" stopOpacity="0" />
          </radialGradient>
        </defs>
        
        {/* Sky background - Dark greenish */}
        <rect width="320" height="240" fill={`url(#wizardSky-${uniqueId})`} />
        
        {/* Moon with greenish tint */}
        <circle cx="240" cy="50" r="35" fill="#6EE7B7" opacity="0.25" />
        <circle cx="240" cy="50" r="28" fill="#a7f3d0" opacity="0.2" />
        
        {/* Mountains in background - dark green */}
        <path d="M0,180 L60,120 L120,160 L180,100 L240,140 L320,80 L320,240 L0,240 Z" 
              fill="#0d1a14" opacity="0.7" />
        
        {/* Magical Academy Complex */}
        {/* Main Academy Building - Center */}
        <g transform="translate(100, 90)">
          {/* Central tower */}
          <rect x="30" y="30" width="50" height="90" fill="#34d399" opacity="0.65" />
          <rect x="30" y="30" width="50" height="90" fill="#10b981" opacity="0.3" />
          <polygon points="30,30 55,5 80,30" fill="#6EE7B7" opacity="0.7" />
          
          {/* Clock/Emblem at top */}
          <circle cx="55" cy="45" r="8" fill="#6EE7B7" opacity="0.8" />
          <circle cx="55" cy="45" r="6" fill="#0d1a14" opacity="0.6" />
          
          {/* Main entrance arch */}
          <path d="M42,90 Q42,75 55,75 Q68,75 68,90 Z" fill="#0d1a14" opacity="0.7" />
          <rect x="42" y="90" width="26" height="30" fill="#0d1a14" opacity="0.7" />
          
          {/* Windows - Glowing green */}
          <rect x="37" y="50" width="8" height="12" fill="#6EE7B7" opacity="0.85" />
          <rect x="65" y="50" width="8" height="12" fill="#6EE7B7" opacity="0.85" />
          <rect x="37" y="70" width="8" height="12" fill="#6EE7B7" opacity="0.8" />
          <rect x="65" y="70" width="8" height="12" fill="#6EE7B7" opacity="0.8" />
        </g>
        
        {/* Left Wing - Library */}
        <g transform="translate(20, 120)">
          <rect x="20" y="40" width="40" height="60" fill="#34d399" opacity="0.6" />
          <rect x="20" y="40" width="40" height="60" fill="#10b981" opacity="0.25" />
          <polygon points="20,40 40,25 60,40" fill="#6EE7B7" opacity="0.65" />
          
          {/* Library windows */}
          <rect x="27" y="50" width="7" height="10" fill="#6EE7B7" opacity="0.75" />
          <rect x="46" y="50" width="7" height="10" fill="#6EE7B7" opacity="0.75" />
          <rect x="27" y="70" width="7" height="10" fill="#6EE7B7" opacity="0.7" />
          <rect x="46" y="70" width="7" height="10" fill="#6EE7B7" opacity="0.7" />
        </g>
        
        {/* Right Wing - Potion Lab */}
        <g transform="translate(200, 125)">
          <rect x="15" y="45" width="35" height="55" fill="#34d399" opacity="0.6" />
          <rect x="15" y="45" width="35" height="55" fill="#10b981" opacity="0.25" />
          <polygon points="15,45 32.5,32 50,45" fill="#6EE7B7" opacity="0.65" />
          
          {/* Lab windows with colored glow */}
          <rect x="20" y="55" width="6" height="9" fill="#6EE7B7" opacity="0.75" />
          <rect x="38" y="55" width="6" height="9" fill="#a7f3d0" opacity="0.75" />
          <rect x="20" y="72" width="6" height="9" fill="#a7f3d0" opacity="0.7" />
          <rect x="38" y="72" width="6" height="9" fill="#6EE7B7" opacity="0.7" />
        </g>
        
        {/* Courtyard elements */}
        {/* Magical fountain */}
        <g transform="translate(160, 180)">
          <ellipse cx="0" cy="0" rx="15" ry="6" fill="#34d399" opacity="0.4" />
          <rect x="-3" y="-12" width="6" height="12" fill="#34d399" opacity="0.5" />
          {/* Water spray */}
          <circle cx="0" cy="-15" r="3" fill="#6EE7B7" opacity="0.6" />
        </g>
        
        {/* Student silhouettes */}
        {/* Student 1 - with book */}
        <g transform="translate(70, 185)">
          <ellipse cx="0" cy="15" rx="8" ry="3" fill="#0d1a14" opacity="0.3" />
          <rect x="-4" y="5" width="8" height="10" fill="#0d1a14" opacity="0.8" />
          <circle cx="0" cy="2" r="3" fill="#0d1a14" opacity="0.8" />
          {/* Book */}
          <rect x="5" y="7" width="4" height="5" fill="#34d399" opacity="0.7" />
        </g>
        
        {/* Student 2 - with wand */}
        <g transform="translate(240, 190)">
          <ellipse cx="0" cy="12" rx="7" ry="3" fill="#0d1a14" opacity="0.3" />
          <rect x="-3" y="3" width="6" height="9" fill="#0d1a14" opacity="0.8" />
          <circle cx="0" cy="0" r="2.5" fill="#0d1a14" opacity="0.8" />
          {/* Wand with spark */}
          <line x1="4" y1="5" x2="10" y2="2" stroke="#34d399" strokeWidth="1.5" opacity="0.8" />
          <circle cx="10" cy="2" r="2" fill="#6EE7B7" opacity="0.9" />
        </g>
        
        {/* Floating magical books */}
        <g opacity="0.7">
          <rect x="50" y="70" width="10" height="13" rx="1" fill="#34d399" opacity="0.6" transform="rotate(-20 55 76.5)" />
          <line x1="52" y1="73" x2="58" y2="73" stroke="#6EE7B7" strokeWidth="1" opacity="0.5" />
          <line x1="52" y1="77" x2="58" y2="77" stroke="#6EE7B7" strokeWidth="1" opacity="0.5" />
        </g>
        
        {/* Floating potion bottle */}
        <g transform="translate(270, 90)">
          <rect x="-3" y="0" width="6" height="10" rx="1" fill="#34d399" opacity="0.5" />
          <circle cx="0" cy="-2" r="2" fill="#a7f3d0" opacity="0.6" />
          <ellipse cx="0" cy="5" rx="2" ry="3" fill="#6EE7B7" opacity="0.4" />
        </g>
        
        {/* Professor with staff */}
        <g transform="translate(190, 175)">
          {/* Robe */}
          <path d="M0,7 L-4,22 L4,22 L0,7 Z" fill="#0d1a14" opacity="0.9" />
          {/* Head */}
          <circle cx="0" cy="5" r="3" fill="#0d1a14" opacity="0.9" />
          {/* Wizard hat */}
          <path d="M-3,5 L0,-3 L3,5 Z" fill="#34d399" opacity="0.7" />
          <ellipse cx="0" cy="5" rx="4" ry="1.5" fill="#34d399" opacity="0.7" />
          {/* Staff */}
          <line x1="5" y1="10" x2="8" y2="0" stroke="#34d399" strokeWidth="1.5" opacity="0.8" />
          <circle cx="8" cy="0" r="2" fill="#6EE7B7" opacity="0.9" />
          <circle cx="8" cy="0" r="3" fill={`url(#magicGlow-${uniqueId})`} />
        </g>
        
        {/* Magical sparkles and floating elements */}
        <circle cx="130" cy="60" r="2" fill="#6EE7B7" opacity="0.8" />
        <circle cx="180" cy="80" r="1.5" fill="#a7f3d0" opacity="0.7" />
        <circle cx="220" cy="100" r="2" fill="#6EE7B7" opacity="0.6" />
        <circle cx="85" cy="110" r="1.5" fill="#34d399" opacity="0.8" />
        <circle cx="260" cy="130" r="2" fill="#a7f3d0" opacity="0.7" />
        
        {/* Enchantment trails */}
        <path d="M140,65 Q145,70 150,65" stroke="#6EE7B7" strokeWidth="1" fill="none" opacity="0.5" />
        <path d="M210,105 Q215,100 220,105" stroke="#a7f3d0" strokeWidth="1" fill="none" opacity="0.5" />
      </svg>
    );
  } else if (themeName === 'detective') {
    return (
      <svg className={styles.themeSvg} viewBox="0 0 320 240" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={`detectiveSky-${uniqueId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2a2520" />
            <stop offset="50%" stopColor="#1a1510" />
            <stop offset="100%" stopColor="#0f0a08" />
          </linearGradient>
        </defs>
        
        {/* Sky background - Warm noir gradient */}
        <rect width="320" height="240" fill={`url(#detectiveSky-${uniqueId})`} />
        
        {/* City buildings silhouette - More visible with warm tones */}
        <rect x="0" y="120" width="60" height="120" fill="#1a1410" opacity="0.95" />
        <rect x="0" y="120" width="60" height="120" fill="#2a2015" opacity="0.5" />
        
        <rect x="70" y="100" width="50" height="140" fill="#1a1410" opacity="0.9" />
        <rect x="70" y="100" width="50" height="140" fill="#2a2015" opacity="0.4" />
        
        <rect x="130" y="130" width="45" height="110" fill="#1a1410" opacity="0.95" />
        <rect x="130" y="130" width="45" height="110" fill="#2a2015" opacity="0.5" />
        
        <rect x="185" y="110" width="55" height="130" fill="#1a1410" opacity="0.9" />
        <rect x="185" y="110" width="55" height="130" fill="#2a2015" opacity="0.4" />
        
        <rect x="250" y="140" width="70" height="100" fill="#1a1410" opacity="0.95" />
        <rect x="250" y="140" width="70" height="100" fill="#2a2015" opacity="0.5" />
        
        {/* Building edges/highlights for depth */}
        <line x1="60" y1="120" x2="60" y2="240" stroke="#4a3a2a" strokeWidth="1" opacity="0.4" />
        <line x1="120" y1="100" x2="120" y2="240" stroke="#4a3a2a" strokeWidth="1" opacity="0.4" />
        <line x1="175" y1="130" x2="175" y2="240" stroke="#4a3a2a" strokeWidth="1" opacity="0.4" />
        <line x1="240" y1="110" x2="240" y2="240" stroke="#4a3a2a" strokeWidth="1" opacity="0.4" />
        
        {/* Windows - Gold with more variety */}
        <rect x="10" y="130" width="8" height="12" fill="#d1b773" opacity="0.7" />
        <rect x="25" y="130" width="8" height="12" fill="#d1b773" opacity="0.8" />
        <rect x="42" y="130" width="8" height="12" fill="#d1b773" opacity="0.6" />
        <rect x="10" y="150" width="8" height="12" fill="#d1b773" opacity="0.5" />
        <rect x="25" y="150" width="8" height="12" fill="#d1b773" opacity="0.7" />
        <rect x="42" y="155" width="8" height="12" fill="#d1b773" opacity="0.6" />
        <rect x="10" y="175" width="8" height="12" fill="#d1b773" opacity="0.8" />
        <rect x="42" y="180" width="8" height="12" fill="#d1b773" opacity="0.5" />
        
        <rect x="80" y="115" width="8" height="12" fill="#d1b773" opacity="0.8" />
        <rect x="95" y="115" width="8" height="12" fill="#d1b773" opacity="0.7" />
        <rect x="80" y="135" width="8" height="12" fill="#d1b773" opacity="0.6" />
        <rect x="95" y="135" width="8" height="12" fill="#d1b773" opacity="0.8" />
        <rect x="80" y="160" width="8" height="12" fill="#d1b773" opacity="0.7" />
        
        <rect x="140" y="145" width="8" height="12" fill="#d1b773" opacity="0.7" />
        <rect x="155" y="145" width="8" height="12" fill="#d1b773" opacity="0.6" />
        <rect x="140" y="170" width="8" height="12" fill="#d1b773" opacity="0.8" />
        
        <rect x="195" y="125" width="8" height="12" fill="#d1b773" opacity="0.8" />
        <rect x="210" y="125" width="8" height="12" fill="#d1b773" opacity="0.7" />
        <rect x="195" y="150" width="8" height="12" fill="#d1b773" opacity="0.6" />
        <rect x="210" y="150" width="8" height="12" fill="#d1b773" opacity="0.7" />
        <rect x="225" y="155" width="8" height="12" fill="#d1b773" opacity="0.5" />
        
        <rect x="260" y="155" width="8" height="12" fill="#d1b773" opacity="0.8" />
        <rect x="275" y="155" width="8" height="12" fill="#d1b773" opacity="0.7" />
        <rect x="260" y="175" width="8" height="12" fill="#d1b773" opacity="0.6" />
        <rect x="290" y="165" width="8" height="12" fill="#d1b773" opacity="0.7" />
        
        {/* Streetlamp - More visible */}
        <line x1="270" y1="160" x2="270" y2="200" stroke="#3a2a1a" strokeWidth="3" opacity="0.9" />
        <circle cx="270" cy="158" r="6" fill="#d1b773" opacity="0.8" />
        <ellipse cx="270" cy="158" rx="18" ry="10" fill="#d1b773" opacity="0.4" />
        
        {/* Detective silhouette - More visible */}
        <g transform="translate(200, 150)">
          {/* Body/coat - Slightly lighter */}
          <path d="M20,35 L15,75 L35,75 L30,35 Z" fill="#1a1410" opacity="0.95" />
          <path d="M20,35 L15,75 L35,75 L30,35 Z" fill="#2a2015" opacity="0.3" />
          {/* Collar */}
          <path d="M18,38 L25,35 L32,38" fill="#1a1410" opacity="0.95" />
          {/* Head */}
          <circle cx="25" cy="30" r="7" fill="#1a1410" opacity="0.95" />
          <circle cx="25" cy="30" r="7" fill="#2a2015" opacity="0.3" />
          {/* Hat */}
          <ellipse cx="25" cy="26" rx="12" ry="4" fill="#1a1410" opacity="0.95" />
          <path d="M18,26 L20,18 L30,18 L32,26 Z" fill="#1a1410" opacity="0.95" />
          <path d="M18,26 L20,18 L30,18 L32,26 Z" fill="#2a2015" opacity="0.3" />
          {/* Magnifying glass - Brighter gold */}
          <circle cx="12" cy="50" r="8" fill="transparent" stroke="#e6c885" strokeWidth="2.5" opacity="0.9" />
          <line x1="7" y1="56" x2="3" y2="62" stroke="#e6c885" strokeWidth="2.5" opacity="0.9" />
          <circle cx="12" cy="50" r="6" fill="#d1b773" opacity="0.3" />
          {/* Lens shine */}
          <circle cx="10" cy="48" r="2" fill="#fff" opacity="0.4" />
        </g>
        
        {/* Floating clues/papers - More visible */}
        <g opacity="0.7">
          <rect x="80" y="70" width="15" height="20" rx="2" fill="#c9b08a" opacity="0.8" transform="rotate(-15 87.5 80)" />
          <line x1="83" y1="75" x2="92" y2="75" stroke="#1a1410" strokeWidth="1" opacity="0.6" />
          <line x1="83" y1="80" x2="90" y2="80" stroke="#1a1410" strokeWidth="1" opacity="0.6" />
        </g>
        
        {/* Evidence markers - Brighter gold and sepia */}
        <circle cx="150" cy="70" r="2.5" fill="#e6c885" opacity="0.8" />
        <circle cx="120" cy="90" r="2" fill="#d1b773" opacity="0.7" />
        <circle cx="240" cy="80" r="2.5" fill="#e6c885" opacity="0.7" />
        <circle cx="50" cy="95" r="1.5" fill="#d1b773" opacity="0.6" />
      </svg>
    );
  } else if (themeName === 'space') {
    return (
      <svg className={styles.themeSvg} viewBox="0 0 320 240" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={`spaceSky-${uniqueId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1a1a2e" />
            <stop offset="50%" stopColor="#0f0f1e" />
            <stop offset="100%" stopColor="#050510" />
          </linearGradient>
          <radialGradient id={`planetGlow-${uniqueId}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </radialGradient>
        </defs>
        
        {/* Space background */}
        <rect width="320" height="240" fill={`url(#spaceSky-${uniqueId})`} />
        
        {/* Stars */}
        <circle cx="30" cy="30" r="1" fill="#ffffff" opacity="0.8" />
        <circle cx="80" cy="50" r="1.5" fill="#ffffff" opacity="0.9" />
        <circle cx="150" cy="20" r="1" fill="#ffffff" opacity="0.7" />
        <circle cx="200" cy="45" r="1.2" fill="#ffffff" opacity="0.8" />
        <circle cx="270" cy="35" r="1" fill="#ffffff" opacity="0.9" />
        <circle cx="100" cy="80" r="1" fill="#ffffff" opacity="0.6" />
        <circle cx="250" cy="70" r="1.3" fill="#ffffff" opacity="0.8" />
        <circle cx="60" cy="110" r="1" fill="#ffffff" opacity="0.7" />
        <circle cx="180" cy="90" r="1.5" fill="#ffffff" opacity="0.9" />
        <circle cx="290" cy="120" r="1" fill="#ffffff" opacity="0.8" />
        
        {/* Planet */}
        <circle cx="80" cy="60" r="35" fill={`url(#planetGlow-${uniqueId})`} />
        <circle cx="80" cy="60" r="30" fill="#6b46a8" opacity="0.4" />
        <ellipse cx="80" cy="60" rx="40" ry="8" fill="#8b5cf6" opacity="0.2" transform="rotate(-20 80 60)" />
        
        {/* Moon/satellite */}
        <circle cx="250" cy="80" r="18" fill="#4a3a5f" opacity="0.5" />
        <circle cx="247" cy="77" r="4" fill="#2d1f3f" opacity="0.7" />
        <circle cx="255" cy="85" r="3" fill="#2d1f3f" opacity="0.6" />
        
        {/* Rocky terrain */}
        <path d="M0,180 Q80,160 160,175 T320,185 L320,240 L0,240 Z" fill="#1a1a2e" opacity="0.8" />
        <path d="M0,200 Q100,190 200,195 T320,200 L320,240 L0,240 Z" fill="#0f0f1e" opacity="0.9" />
        
        {/* Rocks */}
        <ellipse cx="50" cy="195" rx="15" ry="8" fill="#0a0a14" opacity="0.8" />
        <ellipse cx="180" cy="200" rx="20" ry="10" fill="#0a0a14" opacity="0.7" />
        <ellipse cx="280" cy="198" rx="18" ry="9" fill="#0a0a14" opacity="0.8" />
        
        {/* Rocket */}
        <g transform="translate(220, 140)">
          {/* Body */}
          <path d="M20,60 L15,35 Q15,25 20,20 Q25,15 25,15 Q25,15 30,20 Q35,25 35,35 L30,60 Z" 
                fill="#8b5cf6" opacity="0.8" />
          {/* Window */}
          <circle cx="25" cy="35" r="6" fill="#ec4899" opacity="0.6" />
          <circle cx="25" cy="35" r="4" fill="#1a1a2e" opacity="0.9" />
          {/* Fins */}
          <path d="M15,55 L8,65 L15,60 Z" fill="#6366f1" opacity="0.7" />
          <path d="M35,55 L42,65 L35,60 Z" fill="#6366f1" opacity="0.7" />
          {/* Flame */}
          <path d="M18,60 Q20,70 25,75 Q30,70 32,60 Z" fill="#ec4899" opacity="0.6" />
          <path d="M20,60 Q22,68 25,72 Q28,68 30,60 Z" fill="#f0abfc" opacity="0.7" />
        </g>
        
        {/* Astronaut */}
        <g transform="translate(60, 170)">
          {/* Body */}
          <rect x="15" y="35" width="20" height="30" rx="3" fill="#e0e0e0" opacity="0.3" />
          {/* Helmet */}
          <circle cx="25" cy="30" r="10" fill="#f3f3f3" opacity="0.2" />
          <circle cx="25" cy="30" r="7" fill="#6366f1" opacity="0.4" />
          {/* Arms */}
          <rect x="10" y="40" width="4" height="15" rx="2" fill="#e0e0e0" opacity="0.3" />
          <rect x="36" y="40" width="4" height="15" rx="2" fill="#e0e0e0" opacity="0.3" />
          {/* Legs */}
          <rect x="17" y="65" width="6" height="15" rx="2" fill="#e0e0e0" opacity="0.3" />
          <rect x="27" y="65" width="6" height="15" rx="2" fill="#e0e0e0" opacity="0.3" />
          {/* Backpack */}
          <rect x="32" y="38" width="8" height="20" rx="2" fill="#8b5cf6" opacity="0.4" />
        </g>
        
        {/* Glowing particles */}
        <circle cx="140" cy="100" r="2" fill="#ec4899" opacity="0.6" />
        <circle cx="190" cy="130" r="1.5" fill="#8b5cf6" opacity="0.5" />
        <circle cx="110" cy="150" r="2" fill="#f0abfc" opacity="0.4" />
      </svg>
    );
  }
  
  return null;
};

/**
 * TopicCard
 * Renders a topic card with progress, lock state, and theme-aware styles.
 * @param {Object} props
 * @param {Object} props.topic - Topic data (must include .name, .description, .progress, .is_unlocked).
 * @param {Function} props.onClick - Click handler for the card.
 * @param {Object} [props.themeStyles] - Optional theme style classes.
 * @param {boolean} [props.comingSoon] - If true, renders a "Coming Soon" card.
 * @param {Object} [props.retentionTestStatus] - Retention test status for this topic.
 * @param {Function} [props.onRetentionTestClick] - Handler for retention test button clicks.
 */
const TopicCard = React.memo(({ topic, onClick, themeStyles = {}, comingSoon = false, retentionTestStatus = null, onRetentionTestClick = null }) => {
  const navigate = useNavigate();
  if (comingSoon) {
    return (
      <Col
        xs={12}
        sm={6}
        md={4}
        lg={3}
        className={`${themeStyles.floatCard || ""} ${themeStyles.lockedCard || ""}`}
      >
        <div className={themeStyles.lockedEffect || ""}></div>
        <div className={styles.cardContent}>
          <h2 className={styles.cardTitle}>Coming Soon</h2>
          <p className={styles.cardDesc}>New lesson cards will be available soon. Stay tuned!</p>
          <button className={styles.lockedButton} disabled>Coming Soon</button>
        </div>
      </Col>
    );
  }

  const isLocked = !topic.is_unlocked;
  const progress = typeof topic.progress === 'number' ? topic.progress : 0;
  
  // Convert decimal progress (0.0-1.0) to percentage (0-100)
  const progressPercentage = Math.round(progress * 100);

  // Determine button label and behavior based on topic state
  let buttonLabel = "Start Learning";
  let buttonAction = () => onClick(topic);
  let showRetentionTestButton = false;
  let retentionTestButtonAction = null;

  if (isLocked) {
    buttonLabel = "Locked";
    buttonAction = null;
  } else if (progressPercentage === 100) {
    // Topic completed - always show "Review Topic" button
    buttonLabel = "Review Topic";
    buttonAction = () => onClick(topic);
  } else if (progressPercentage > 0) {
    buttonLabel = "Continue Learning";
    buttonAction = () => onClick(topic);
  }

  return (
    <Col
      xs={12}
      sm={6}
      md={4}
      lg={3}
      className={`${themeStyles.floatCard || ""} ${isLocked ? themeStyles.lockedCard || "" : ""}`}
    >
      {/* Themed SVG Background */}
      {renderThemeBackground(topic.theme, topic.id)}
      
      <div
        className={`${themeStyles.holographicEffect || ""} ${isLocked ? themeStyles.lockedEffect || "" : ""}`}
      ></div>
      <div className={styles.cardContent} data-joyride={`topic-card-${topic.id}`}>
        <h2 className={styles.cardTitle}>{topic.name}</h2>
        <p className={styles.cardDesc}>{topic.description}</p>
        <div className={styles.cardProgress}>
          <div
            className={styles.progressFill}
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <button
          className={`${styles.startButton} ${isLocked ? styles.lockedButton : ""}`}
          disabled={isLocked}
          onClick={buttonAction}
        >
          {buttonLabel}
        </button>
        
        {/* Retention Test Results Icon - Show if any stage is completed */}
        {retentionTestStatus && retentionTestStatus.availability && (retentionTestStatus.availability.first_stage_completed || retentionTestStatus.availability.second_stage_completed) && (
          <div className={styles.retentionTestContainer}>
            <div className={styles.iconContainer}>
              <button
                className={styles.retentionResultsIcon}
                onClick={() => onRetentionTestClick && onRetentionTestClick(topic, true)}
                aria-label="View Retention Test Results"
              >
                📊
              </button>
              <div className={styles.tooltip}>View Retention Test Results</div>
            </div>
          </div>
        )}
        

      </div>
      {isLocked && <div className={styles.lockedIcon}>🔒</div>}
    </Col>
  );
});

TopicCard.propTypes = {
  topic: PropTypes.shape({
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    progress: PropTypes.number,
    is_unlocked: PropTypes.bool.isRequired,
  }).isRequired,
  onClick: PropTypes.func.isRequired,
  themeStyles: PropTypes.object,
  comingSoon: PropTypes.bool,
  retentionTestStatus: PropTypes.shape({
    is_completed: PropTypes.bool,
    isAvailable: PropTypes.bool,
  }),
  onRetentionTestClick: PropTypes.func,
};

export default TopicCard;
