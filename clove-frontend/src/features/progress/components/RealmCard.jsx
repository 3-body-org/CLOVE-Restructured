import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrophy,
  faChevronDown,
  faChevronUp,
  faChartPie,
  faMap,
  faMountain,
  faLightbulb,
  faExclamationTriangle,
  faLayerGroup,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../styles/ProgressPage.module.scss";
import { getRealmTheme, getThemeColors, getRealmStatus } from "../config/realmThemeConfig";
import { SubtopicCard, TopicProficiencyBadge, getMasteryLevel } from "./ProgressAnalytics";

// SVG backgrounds for realm cards based on topic theme
const getRealmSVG = (topicTitle, topicTheme) => {
  // Generate unique ID for gradients
  const uniqueId = `realm-${topicTitle?.replace(/\s+/g, '-')}` || 'unknown';
  
  if (topicTheme === 'wizard') {
    // Wizard/Magic theme - Tower with magical elements (enhanced)
    return (
      <svg className={styles.realmSvg} viewBox="0 0 1200 130" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMaxYMid slice">
        <defs>
          <radialGradient id={`wizardGlow-${uniqueId}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#6EE7B7" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#6EE7B7" stopOpacity="0" />
          </radialGradient>
        </defs>
        
        {/* Magical Tower - right side */}
        <g transform="translate(1050, 40)" opacity="0.12">
          {/* Tower body */}
          <rect x="-15" y="0" width="30" height="70" fill="#34d399" opacity="0.6"/>
          {/* Tower roof */}
          <polygon points="-20,0 0,-20 20,0" fill="#6EE7B7" opacity="0.7"/>
          {/* Tower windows */}
          <rect x="-8" y="15" width="6" height="8" fill="#6EE7B7" opacity="0.8"/>
          <rect x="2" y="15" width="6" height="8" fill="#6EE7B7" opacity="0.8"/>
          <rect x="-8" y="30" width="6" height="8" fill="#6EE7B7" opacity="0.7"/>
          <rect x="2" y="30" width="6" height="8" fill="#6EE7B7" opacity="0.7"/>
          {/* Tower door */}
          <path d="M -5,50 Q -5,42 0,42 Q 5,42 5,50 Z" fill="#10b981" opacity="0.5"/>
          <rect x="-5" y="50" width="10" height="20" fill="#10b981" opacity="0.5"/>
          {/* Magical glow from top */}
          <circle cx="0" cy="-20" r="15" fill={`url(#wizardGlow-${uniqueId})`}/>
          {/* Magic beam shooting up */}
          <line x1="0" y1="-20" x2="0" y2="-35" stroke="#6EE7B7" strokeWidth="2" opacity="0.6"/>
        </g>
        
        {/* Floating spell books - more books */}
        <g opacity="0.1">
          <rect x="850" y="60" width="25" height="35" rx="2" fill="#34d399" transform="rotate(-12 862.5 77.5)"/>
          <line x1="855" y1="70" x2="873" y2="70" stroke="#6EE7B7" strokeWidth="1.5"/>
          <line x1="855" y1="78" x2="873" y2="78" stroke="#6EE7B7" strokeWidth="1.5"/>
          <line x1="855" y1="86" x2="870" y2="86" stroke="#6EE7B7" strokeWidth="1.5"/>
          
          {/* Second spell book */}
          <rect x="550" y="55" width="22" height="30" rx="2" fill="#10b981" transform="rotate(8 561 70)"/>
          <line x1="555" y1="63" x2="570" y2="63" stroke="#a7f3d0" strokeWidth="1.2"/>
          <line x1="555" y1="69" x2="570" y2="69" stroke="#a7f3d0" strokeWidth="1.2"/>
        </g>
        
        {/* Magic wand with sparkles */}
        <g opacity="0.12" transform="translate(750, 70)">
          <line x1="0" y1="0" x2="40" y2="-30" stroke="#10b981" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="40" cy="-30" r="5" fill="#6EE7B7" opacity="0.8"/>
          <circle cx="40" cy="-30" r="10" fill={`url(#wizardGlow-${uniqueId})`}/>
          {/* Wand sparkles */}
          <circle cx="45" cy="-35" r="1.5" fill="#fff"/>
          <circle cx="35" cy="-25" r="1.2" fill="#fff"/>
        </g>
        
        {/* Potion bottles with glowing liquid */}
        <g opacity="0.1" transform="translate(950, 70)">
          <rect x="0" y="10" width="14" height="30" rx="2" fill="#34d399"/>
          <ellipse cx="7" cy="15" rx="5" ry="8" fill="#6EE7B7" opacity="0.6"/>
          <circle cx="7" cy="8" r="4" fill="#10b981"/>
          
          <rect x="20" y="18" width="12" height="25" rx="2" fill="#10b981"/>
          <ellipse cx="26" cy="23" rx="4" ry="6" fill="#a7f3d0" opacity="0.6"/>
          <circle cx="26" cy="16" r="3.5" fill="#34d399"/>
        </g>
        
        {/* Additional floating potions */}
        <g opacity="0.12" transform="translate(400, 68)">
          <rect x="0" y="0" width="11" height="25" rx="2" fill="#6EE7B7"/>
          <ellipse cx="5.5" cy="8" rx="4" ry="7" fill="#34d399" opacity="0.5"/>
          <circle cx="5.5" cy="3" r="3" fill="#10b981"/>
        </g>
        
        {/* Sparkle trail across - enhanced */}
        <g opacity="0.15">
          <path d="M 300 50 L 302 55 L 307 57 L 302 59 L 300 64 L 298 59 L 293 57 L 298 55 Z" fill="#6EE7B7"/>
          <path d="M 450 70 L 452 75 L 457 77 L 452 79 L 450 84 L 448 79 L 443 77 L 448 75 Z" fill="#34d399"/>
          <path d="M 600 45 L 602 50 L 607 52 L 602 54 L 600 59 L 598 54 L 593 52 L 598 50 Z" fill="#a7f3d0"/>
          <path d="M 700 85 L 702 90 L 707 92 L 702 94 L 700 99 L 698 94 L 693 92 L 698 90 Z" fill="#6EE7B7"/>
          {/* More sparkles */}
          <circle cx="350" cy="58" r="1.5" fill="#a7f3d0"/>
          <circle cx="500" cy="62" r="1.2" fill="#6EE7B7"/>
          <circle cx="650" cy="55" r="1.3" fill="#10b981"/>
        </g>
        
        {/* Crystal ball */}
        <g opacity="0.1" transform="translate(200, 60)">
          <circle cx="0" cy="0" r="25" fill="#6EE7B7" opacity="0.3"/>
          <circle cx="-5" cy="-5" r="8" fill="#fff" opacity="0.4"/>
          <ellipse cx="0" cy="25" rx="18" ry="5" fill="#34d399" opacity="0.5"/>
        </g>
        
        {/* Mystical symbols floating */}
        <g opacity="0.08">
          {/* Star symbol */}
          <path d="M 120 75 L 122 80 L 127 80 L 123 83 L 125 88 L 120 85 L 115 88 L 117 83 L 113 80 L 118 80 Z" fill="#6EE7B7"/>
          {/* Moon crescent */}
          <path d="M 630 35 Q 625 38, 625 43 Q 625 48, 630 51 Q 627 49, 625 45 Q 625 41, 627 39 Q 628 37, 630 35 Z" fill="#34d399"/>
        </g>
        
        {/* Magical particles floating */}
        <g opacity="0.12">
          <circle cx="280" cy="80" r="1" fill="#6EE7B7"/>
          <circle cx="480" cy="50" r="1.2" fill="#a7f3d0"/>
          <circle cx="680" cy="75" r="0.8" fill="#10b981"/>
          <circle cx="820" cy="45" r="1" fill="#34d399"/>
        </g>
      </svg>
    );
  }
  
  if (topicTheme === 'detective') {
    // Detective theme - Large streetlamp on right with city background (enhanced)
    return (
      <svg className={styles.realmSvg} viewBox="0 0 1200 130" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMaxYMid slice">
        <defs>
          <radialGradient id={`lampGlow-${uniqueId}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#e6c885" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#e6c885" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`smokeGradient-${uniqueId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#d1b773" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#d1b773" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* City skyline silhouettes in background - left and center */}
        <g opacity="0.08" fill="#c9b08a">
          {/* Left buildings */}
          <rect x="50" y="75" width="60" height="55"/>
          <rect x="120" y="65" width="70" height="65"/>
          <rect x="200" y="80" width="55" height="50"/>
          
          {/* Center buildings */}
          <rect x="300" y="70" width="65" height="60"/>
          <rect x="375" y="75" width="50" height="55"/>
          <rect x="435" y="68" width="68" height="62"/>
          
          {/* More center */}
          <rect x="520" y="78" width="58" height="52"/>
          <rect x="590" y="72" width="62" height="58"/>
          <rect x="660" y="80" width="52" height="50"/>
          
          {/* Fading to right */}
          <rect x="730" y="85" width="48" height="45"/>
          <rect x="790" y="82" width="45" height="48"/>
        </g>
        
        {/* Building windows scattered - more windows */}
        <g opacity="0.1" fill="#e6c885">
          {/* Left buildings */}
          <rect x="70" y="85" width="5" height="6"/>
          <rect x="80" y="85" width="5" height="6"/>
          <rect x="90" y="85" width="5" height="6"/>
          <rect x="70" y="95" width="5" height="6"/>
          <rect x="80" y="95" width="5" height="6"/>
          <rect x="90" y="95" width="5" height="6"/>
          <rect x="70" y="105" width="5" height="6"/>
          <rect x="80" y="105" width="5" height="6"/>
          
          <rect x="140" y="78" width="5" height="6"/>
          <rect x="150" y="78" width="5" height="6"/>
          <rect x="160" y="78" width="5" height="6"/>
          <rect x="170" y="78" width="5" height="6"/>
          <rect x="140" y="88" width="5" height="6"/>
          <rect x="150" y="88" width="5" height="6"/>
          <rect x="160" y="88" width="5" height="6"/>
          <rect x="140" y="98" width="5" height="6"/>
          <rect x="150" y="98" width="5" height="6"/>
          
          {/* Center buildings */}
          <rect x="320" y="82" width="5" height="6"/>
          <rect x="330" y="82" width="5" height="6"/>
          <rect x="340" y="82" width="5" height="6"/>
          <rect x="320" y="92" width="5" height="6"/>
          <rect x="330" y="92" width="5" height="6"/>
          
          <rect x="450" y="80" width="5" height="6"/>
          <rect x="460" y="80" width="5" height="6"/>
          <rect x="470" y="80" width="5" height="6"/>
          <rect x="450" y="90" width="5" height="6"/>
          <rect x="460" y="90" width="5" height="6"/>
          
          <rect x="610" y="85" width="5" height="6"/>
          <rect x="620" y="85" width="5" height="6"/>
          <rect x="630" y="85" width="5" height="6"/>
          <rect x="610" y="95" width="5" height="6"/>
          <rect x="620" y="95" width="5" height="6"/>
        </g>
        
        {/* Large streetlamp on right side */}
        <g transform="translate(1070, 20)" opacity="0.15">
          {/* Lamp post */}
          <line x1="0" y1="0" x2="0" y2="95" stroke="#d1b773" strokeWidth="5"/>
          
          {/* Decorative post details */}
          <rect x="-8" y="20" width="16" height="3" fill="#c9b08a"/>
          <rect x="-8" y="50" width="16" height="3" fill="#c9b08a"/>
          <rect x="-8" y="80" width="16" height="3" fill="#c9b08a"/>
          
          {/* Lamp housing */}
          <rect x="-18" y="-18" width="36" height="24" rx="4" fill="#e6c885"/>
          
          {/* Large glow effect */}
          <circle cx="0" cy="-6" r="45" fill={`url(#lampGlow-${uniqueId})`}/>
          
          {/* Light beam projecting down */}
          <polygon points="-15,6 15,6 35,110 -35,110" fill="#e6c885" opacity="0.08"/>
          
          {/* Light rays */}
          <line x1="0" y1="6" x2="-25" y2="80" stroke="#e6c885" strokeWidth="1" opacity="0.15"/>
          <line x1="0" y1="6" x2="25" y2="80" stroke="#e6c885" strokeWidth="1" opacity="0.15"/>
        </g>
        
        {/* Fog/atmosphere in foreground - enhanced */}
        <g opacity="0.05">
          <ellipse cx="950" cy="110" rx="180" ry="25" fill="#e6c885"/>
          <ellipse cx="850" cy="115" rx="150" ry="20" fill="#d1b773"/>
          <ellipse cx="700" cy="118" rx="120" ry="15" fill="#c9b08a"/>
        </g>
        
        {/* Cigarette smoke effect - noir atmosphere */}
        <g opacity="0.08">
          <path d="M 250 100 Q 255 85, 260 95 Q 265 105, 270 90" 
                stroke="#d1b773" strokeWidth="1.5" fill="none"/>
          <path d="M 500 105 Q 505 90, 510 100 Q 515 110, 520 95" 
                stroke="#c9b08a" strokeWidth="1.5" fill="none"/>
        </g>
        
        {/* Small distant lights - more atmospheric */}
        <g opacity="0.12">
          <circle cx="200" cy="50" r="2" fill="#e6c885"/>
          <circle cx="350" cy="45" r="2" fill="#e6c885"/>
          <circle cx="480" cy="48" r="2" fill="#e6c885"/>
          <circle cx="600" cy="43" r="2" fill="#e6c885"/>
          {/* Additional street lights in distance */}
          <circle cx="280" cy="52" r="1.5" fill="#d1b773"/>
          <circle cx="420" cy="46" r="1.5" fill="#d1b773"/>
          <circle cx="540" cy="50" r="1.5" fill="#d1b773"/>
        </g>
        
        {/* Rain effect - subtle */}
        <g opacity="0.06">
          <line x1="150" y1="20" x2="148" y2="35" stroke="#d1b773" strokeWidth="0.5"/>
          <line x1="300" y1="25" x2="298" y2="40" stroke="#d1b773" strokeWidth="0.5"/>
          <line x1="450" y1="15" x2="448" y2="30" stroke="#d1b773" strokeWidth="0.5"/>
          <line x1="550" y1="30" x2="548" y2="45" stroke="#d1b773" strokeWidth="0.5"/>
          <line x1="700" y1="20" x2="698" y2="35" stroke="#d1b773" strokeWidth="0.5"/>
          <line x1="850" y1="25" x2="848" y2="40" stroke="#d1b773" strokeWidth="0.5"/>
        </g>
        
        {/* Silhouette of detective figure - very subtle */}
        <g opacity="0.06" transform="translate(380, 85)">
          <ellipse cx="0" cy="20" rx="8" ry="4" fill="#3a2a1a"/> {/* Shadow */}
          <rect x="-4" y="5" width="8" height="15" fill="#3a2a1a"/> {/* Body */}
          <circle cx="0" cy="-2" r="4" fill="#3a2a1a"/> {/* Head */}
          <ellipse cx="0" cy="-3" rx="7" ry="2" fill="#3a2a1a"/> {/* Hat brim */}
          <rect x="-3" y="-8" width="6" height="5" fill="#3a2a1a"/> {/* Hat top */}
        </g>
      </svg>
    );
  }
  
  if (topicTheme === 'space') {
    // Space theme - Star constellations, planets, orbitals
    return (
      <svg className={styles.realmSvg} viewBox="0 0 1200 130" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMaxYMid slice">
        <defs>
          <radialGradient id={`spaceGlow-${uniqueId}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`planetGlow-${uniqueId}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ec4899" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
          </radialGradient>
        </defs>
        
        {/* Large planet with rings - right side */}
        <g transform="translate(1050, 65)" opacity="0.12">
          <circle cx="0" cy="0" r="35" fill={`url(#spaceGlow-${uniqueId})`}/>
          <circle cx="0" cy="0" r="28" fill="#8b5cf6" opacity="0.3"/>
          {/* Planet rings */}
          <ellipse cx="0" cy="0" rx="50" ry="12" fill="none" stroke="#a6aafb" strokeWidth="2" opacity="0.5" transform="rotate(-20)"/>
          <ellipse cx="0" cy="0" rx="50" ry="12" fill="none" stroke="#8b5cf6" strokeWidth="1.5" opacity="0.3" transform="rotate(-20)"/>
        </g>
        
        {/* Small planet */}
        <g transform="translate(950, 90)" opacity="0.1">
          <circle cx="0" cy="0" r="20" fill={`url(#planetGlow-${uniqueId})`}/>
          <circle cx="0" cy="0" r="15" fill="#ec4899" opacity="0.3"/>
        </g>
        
        {/* Orbital paths (representing loops) */}
        <g opacity="0.1">
          <ellipse cx="750" cy="65" rx="85" ry="55" fill="none" stroke="#a6aafb" strokeWidth="1.5" strokeDasharray="8,8"/>
          <ellipse cx="750" cy="65" rx="65" ry="40" fill="none" stroke="#8b5cf6" strokeWidth="1.2" strokeDasharray="6,6"/>
          <ellipse cx="750" cy="65" rx="45" ry="28" fill="none" stroke="#f0abfc" strokeWidth="1" strokeDasharray="4,4"/>
          {/* Small orbiting object */}
          <circle cx="835" cy="65" r="4" fill="#ec4899" opacity="0.8"/>
        </g>
        
        {/* Constellation pattern - connected stars */}
        <g opacity="0.15">
          {/* Constellation 1 */}
          <line x1="250" y1="40" x2="290" y2="30" stroke="#a6aafb" strokeWidth="0.8"/>
          <line x1="290" y1="30" x2="320" y2="50" stroke="#a6aafb" strokeWidth="0.8"/>
          <line x1="320" y1="50" x2="280" y2="65" stroke="#a6aafb" strokeWidth="0.8"/>
          <line x1="280" y1="65" x2="250" y2="40" stroke="#a6aafb" strokeWidth="0.8"/>
          <circle cx="250" cy="40" r="2" fill="#fff"/>
          <circle cx="290" cy="30" r="2.5" fill="#fff"/>
          <circle cx="320" cy="50" r="2" fill="#fff"/>
          <circle cx="280" cy="65" r="2" fill="#fff"/>
          
          {/* Constellation 2 */}
          <line x1="450" y1="50" x2="480" y2="45" stroke="#8b5cf6" strokeWidth="0.8"/>
          <line x1="480" y1="45" x2="500" y2="65" stroke="#8b5cf6" strokeWidth="0.8"/>
          <line x1="500" y1="65" x2="470" y2="75" stroke="#8b5cf6" strokeWidth="0.8"/>
          <circle cx="450" cy="50" r="2" fill="#fff"/>
          <circle cx="480" cy="45" r="2.5" fill="#fff"/>
          <circle cx="500" cy="65" r="2" fill="#fff"/>
          <circle cx="470" cy="75" r="2" fill="#fff"/>
        </g>
        
        {/* Scattered stars */}
        <g opacity="0.2">
          <circle cx="180" cy="35" r="1.5" fill="#fff"/>
          <circle cx="220" cy="80" r="1" fill="#fff"/>
          <circle cx="350" cy="25" r="1.2" fill="#fff"/>
          <circle cx="400" cy="90" r="1" fill="#fff"/>
          <circle cx="550" cy="30" r="1.5" fill="#fff"/>
          <circle cx="600" cy="95" r="1.2" fill="#fff"/>
          <circle cx="650" cy="40" r="1" fill="#fff"/>
          <circle cx="850" cy="35" r="1.3" fill="#fff"/>
          <circle cx="900" cy="105" r="1" fill="#fff"/>
          <circle cx="1120" cy="25" r="1.2" fill="#fff"/>
        </g>
        
        {/* Shooting star/comet */}
        <g opacity="0.1">
          <line x1="550" y1="50" x2="620" y2="70" stroke="#f0abfc" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="620" cy="70" r="3" fill="#f0abfc"/>
          {/* Trail */}
          <line x1="550" y1="50" x2="580" y2="58" stroke="#ec4899" strokeWidth="1" opacity="0.6"/>
          <line x1="560" y1="52" x2="590" y2="61" stroke="#a6aafb" strokeWidth="0.8" opacity="0.5"/>
        </g>
        
        {/* Small asteroids */}
        <g opacity="0.08">
          <circle cx="380" cy="95" r="3" fill="#8a8a8a"/>
          <circle cx="520" cy="100" r="2.5" fill="#a0a0a0"/>
          <circle cx="680" cy="90" r="2" fill="#8a8a8a"/>
        </g>
      </svg>
    );
  }
  
  return null;
};

/**
 * RealmCard Component
 * Displays a realm card with themed background, progress ring, and expandable details
 * Memoized for performance optimization
 */
const RealmCard = React.memo(({ 
  topic, 
  index, 
  isExpanded, 
  strengthsExpanded, 
  toggleTopic, 
  toggleStrengths,
  getStrengthsWeaknesses,
  calculateTopicProficiency
}) => {
  // Memoize expensive calculations
  const overallProgress = useMemo(() => 
    Math.round((topic.progress_percent || 0) * 100),
    [topic.progress_percent]
  );

  const { strengths, weaknesses } = useMemo(() => 
    getStrengthsWeaknesses(topic.subtopics || []),
    [topic.subtopics, getStrengthsWeaknesses]
  );

  const topicProficiency = useMemo(() => 
    calculateTopicProficiency(topic.subtopics || []),
    [topic.subtopics, calculateTopicProficiency]
  );

  const topicTitle = topic.topic?.title || topic.title || "Untitled Topic";
  const topicTheme = topic.topic?.theme || topic.theme || 'default';
  
  const realmTheme = useMemo(() => 
    getRealmTheme(topicTitle, topicTheme),
    [topicTitle, topicTheme]
  );

  const themeColors = useMemo(() => 
    getThemeColors(realmTheme),
    [realmTheme]
  );

  const realmStatus = useMemo(() => 
    getRealmStatus(overallProgress),
    [overallProgress]
  );

  const { isCompleted, isInProgress } = realmStatus;

  // Memoize SVG background
  const realmSvg = useMemo(() => 
    getRealmSVG(topicTitle, topicTheme),
    [topicTitle, topicTheme]
  );

  // Memoize progress ring calculations
  const { ringRadius, ringCircumference, ringOffset } = useMemo(() => {
    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - overallProgress / 100);
    return { ringRadius: radius, ringCircumference: circumference, ringOffset: offset };
  }, [overallProgress]);

  return (
    <motion.div
      key={topic.topic_id}
      className={`${styles.realmCard} ${isCompleted ? styles.completed : ''} ${isInProgress && !isCompleted ? styles.inProgress : ''}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={{
        '--theme-color': themeColors.color,
        '--theme-shadow': themeColors.shadowColor,
      }}
    >
      {/* Background SVG */}
      {realmSvg}
      
      {/* Left Side - Portal/Icon */}
      <div className={styles.realmPortal}>
        <div className={styles.portalInner}>
          <div className={styles.portalGlow} />
          <div className={styles.portalIconContainer}>
            <FontAwesomeIcon 
              icon={isCompleted ? faTrophy : isInProgress ? faMountain : faMap}
              className={styles.portalIcon}
            />
          </div>
        </div>
        
        {/* Progress Ring Around Portal */}
        <svg className={styles.portalRing} viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r={ringRadius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth="4"
          />
          <motion.circle
            cx="60"
            cy="60"
            r={ringRadius}
            fill="none"
            stroke={isCompleted ? '#10b981' : themeColors.color}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={ringCircumference}
            initial={{ strokeDashoffset: ringCircumference }}
            animate={{ strokeDashoffset: ringOffset }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{
              transform: "rotate(-90deg)",
              transformOrigin: "50% 50%",
            }}
          />
        </svg>
      </div>

      {/* Center - Main Content */}
      <div className={styles.realmContent}>
        <div className={styles.realmContentHeader}>
          <div className={styles.realmTitleRow}>
            <h3 className={styles.realmTitle}>
              {topicTitle}
            </h3>
            <TopicProficiencyBadge proficiency={topicProficiency} />
          </div>
          
          <div className={styles.realmStats}>
            <div className={styles.statPill}>
              <FontAwesomeIcon icon={faLayerGroup} />
              <span>{topic.subtopics?.length || 0} Subtopics</span>
            </div>
            {strengths.length > 0 && (
              <div className={styles.statPill}>
                <FontAwesomeIcon icon={faLightbulb} style={{ color: '#10b981' }} />
                <span>{strengths.length} Strong</span>
              </div>
            )}
            {weaknesses.length > 0 && (
              <div className={styles.statPill}>
                <FontAwesomeIcon icon={faExclamationTriangle} style={{ color: '#ef4444' }} />
                <span>{weaknesses.length} Focus</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className={styles.progressBarSection}>
          <div className={styles.progressBarTrack}>
            <motion.div 
              className={styles.progressBarFill}
              initial={{ width: 0 }}
              animate={{ width: `${overallProgress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              style={{
                background: isCompleted 
                  ? 'linear-gradient(90deg, #10b981, #059669)' 
                  : `linear-gradient(90deg, ${themeColors.color}, ${themeColors.color}dd)`,
                boxShadow: `0 0 10px ${themeColors.shadowColor}`
              }}
            />
          </div>
          <div className={styles.progressText}>
            <span className={styles.progressPercent}>{overallProgress}%</span>
            <span className={styles.progressStatus}>
              {isCompleted ? 'Completed' : isInProgress ? 'In Progress' : 'Not Started'}
            </span>
          </div>
        </div>
      </div>

      {/* Right Side - Expand Button */}
      <motion.button
        className={styles.realmExpandButton}
        onClick={() => toggleTopic(topic.topic_id)}
        whileHover={{ scale: 1.05, backgroundColor: 'rgba(139, 92, 246, 0.2)' }}
        whileTap={{ scale: 0.95 }}
      >
        <FontAwesomeIcon 
          icon={isExpanded ? faChevronUp : faChevronDown}
        />
      </motion.button>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className={styles.realmExpanded}
            data-joyride="realm-details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Performance Analysis */}
            <div className={styles.performanceSection}>
              <div 
                className={styles.performanceToggle}
                onClick={() => toggleStrengths(topic.topic_id)}
              >
                <div className={styles.performanceToggleLeft}>
                  <FontAwesomeIcon icon={faChartPie} />
                  <span>Performance Analysis</span>
                </div>
                <FontAwesomeIcon icon={strengthsExpanded ? faChevronUp : faChevronDown} />
              </div>

              <AnimatePresence>
                {strengthsExpanded && (
                  <motion.div
                    className={styles.performanceContent}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className={styles.performanceGrid}>
                      {/* Strengths */}
                      <div className={styles.performanceColumn}>
                        <div className={styles.performanceColumnHeader}>
                          <FontAwesomeIcon icon={faLightbulb} style={{ color: '#10b981' }} />
                          <h4>Strengths</h4>
                        </div>
                        <div className={styles.performanceList}>
                          {strengths.length > 0 ? (
                            strengths.map((st, idx) => (
                              <div
                                key={idx}
                                className={styles.performanceItem}
                              >
                                <span className={styles.performanceDot} style={{ background: '#10b981' }} />
                                <span className={styles.performanceName}>
                                  {st.subtopic?.title || "Untitled"}
                                </span>
                                <span className={styles.performanceValue}>
                                  {Math.round(st.knowledge_level * 100)}%
                                </span>
                              </div>
                            ))
                          ) : (
                            <div className={styles.performanceEmpty}>
                              No strengths yet
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Focus Areas */}
                      <div className={styles.performanceColumn}>
                        <div className={styles.performanceColumnHeader}>
                          <FontAwesomeIcon icon={faExclamationTriangle} style={{ color: '#ef4444' }} />
                          <h4>Focus Areas</h4>
                        </div>
                        <div className={styles.performanceList}>
                          {weaknesses.length > 0 ? (
                            weaknesses.map((st, idx) => (
                              <div
                                key={idx}
                                className={styles.performanceItem}
                              >
                                <span className={styles.performanceDot} style={{ background: '#ef4444' }} />
                                <span className={styles.performanceName}>
                                  {st.subtopic?.title || "Untitled"}
                                </span>
                                <span className={styles.performanceValue}>
                                  {Math.round(st.knowledge_level * 100)}%
                                </span>
                              </div>
                            ))
                          ) : (
                            <div className={styles.performanceEmpty}>
                              No focus areas
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Subtopics Grid */}
            <div className={styles.subtopicsSection}>
              <div className={styles.subtopicsHeader}>
                <FontAwesomeIcon icon={faLayerGroup} />
                <span>All Subtopics</span>
              </div>
              <div className={styles.subtopicsGrid}>
                {(topic.subtopics || []).map((subtopic) => (
                  <SubtopicCard
                    key={subtopic.id}
                    name={subtopic.name || subtopic.title || subtopic.subtopic?.title || "Untitled Subtopic"}
                    masteryLevel={getMasteryLevel(subtopic.knowledge_level ?? 0.1)}
                    progress={Math.round((subtopic.progress_percent || 0) * 100)}
                    knowledge={Math.round((subtopic.knowledge_level ?? 0.1) * 100)}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

RealmCard.displayName = 'RealmCard';

export default RealmCard;

