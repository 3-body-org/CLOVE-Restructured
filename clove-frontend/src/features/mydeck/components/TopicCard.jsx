/**
 * @file TopicCard.jsx
 * @description Renders a topic card with progress, lock state, and theme-aware styles.
 */

import React from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import styles from "features/mydeck/styles/TopicCard.module.scss";

/**
 * Render themed SVG background based on topic theme - Enhanced with more interactive elements
 */
const renderThemeBackground = (themeName, topicId) => {
  const uniqueId = `topic-card-${topicId}`;
  
  if (themeName === 'wizard') {
    return (
      <svg className={styles.themeSvg} viewBox="0 0 500 500" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={`wizardSky-${uniqueId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0a1a14" />
            <stop offset="30%" stopColor="#1a2e26" />
            <stop offset="70%" stopColor="#0d1a14" />
            <stop offset="100%" stopColor="#050a08" />
          </linearGradient>
          <radialGradient id={`magicGlow-${uniqueId}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#6EE7B7" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#34d399" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`moonGlow-${uniqueId}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#a7f3d0" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#6EE7B7" stopOpacity="0" />
          </radialGradient>
          <filter id={`glow-${uniqueId}`}>
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Full card background with gradient */}
        <rect width="500" height="500" fill={`url(#wizardSky-${uniqueId})`} />
        
        {/* Magical glow overlay */}
        <rect width="500" height="500" fill={`url(#magicGlow-${uniqueId})`} opacity="0.3">
          <animate attributeName="opacity" values="0.3;0.5;0.3" dur="4s" repeatCount="indefinite" />
        </rect>
        
        {/* Animated moon with pulsing glow */}
        <circle cx="320" cy="80" r="45" fill={`url(#moonGlow-${uniqueId})`}>
          <animate attributeName="r" values="45;48;45" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="320" cy="80" r="35" fill="#a7f3d0" opacity="0.4">
          <animate attributeName="opacity" values="0.4;0.6;0.4" dur="2.5s" repeatCount="indefinite" />
        </circle>
        
        {/* Animated magical sparkles across the card */}
        {[...Array(20)].map((_, i) => {
          const x = (i * 25) % 500;
          const y = (i * 25) % 500;
          return (
            <circle key={i} cx={x} cy={y} r="1.5" fill="#6EE7B7" opacity="0.6">
              <animate attributeName="opacity" values="0.3;1;0.3" dur={`${1.5 + (i % 3)}s`} repeatCount="indefinite" />
              <animate attributeName="r" values="1.5;2.5;1.5" dur={`${2 + (i % 2)}s`} repeatCount="indefinite" />
            </circle>
          );
        })}
        
        {/* Mountains silhouette with animated mist */}
        <path d="M0,350 Q100,250 200,300 T500,280 L500,500 L0,500 Z" fill="#0d1a14" opacity="0.8" />
        <path d="M0,380 Q120,280 240,330 T500,310 L500,500 L0,500 Z" fill="#050a08" opacity="0.9" />
        
        {/* Floating mist effect */}
        <ellipse cx="100" cy="320" rx="80" ry="20" fill="#34d399" opacity="0.15">
          <animateTransform attributeName="transform" type="translate" values="0,0; 20,-10; 0,0" dur="8s" repeatCount="indefinite" />
        </ellipse>
        <ellipse cx="300" cy="340" rx="60" ry="15" fill="#6EE7B7" opacity="0.12">
          <animateTransform attributeName="transform" type="translate" values="0,0; -15,-8; 0,0" dur="6s" repeatCount="indefinite" />
        </ellipse>
        
        {/* Enhanced Magical Academy - Larger and more detailed */}
        <g transform="translate(120, 200)">
          {/* Main tower with animated glow */}
          <rect x="40" y="40" width="60" height="120" fill="#34d399" opacity="0.7">
            <animate attributeName="opacity" values="0.7;0.85;0.7" dur="3s" repeatCount="indefinite" />
          </rect>
          <rect x="40" y="40" width="60" height="120" fill="#10b981" opacity="0.4" />
          <polygon points="40,40 70,10 100,40" fill="#6EE7B7" opacity="0.8">
            <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite" />
          </polygon>
          
          {/* Pulsing magical orb at top */}
          <circle cx="70" cy="55" r="12" fill="#6EE7B7" filter={`url(#glow-${uniqueId})`}>
            <animate attributeName="r" values="12;15;12" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.9;1;0.9" dur="1.5s" repeatCount="indefinite" />
          </circle>
          
          {/* Animated windows with magical light */}
          {[50, 75, 100, 125].map((y, i) => (
            <g key={i}>
              <rect x="50" y={y} width="10" height="14" fill="#6EE7B7" opacity="0.9">
                <animate attributeName="opacity" values="0.7;1;0.7" dur={`${1.8 + i * 0.3}s`} repeatCount="indefinite" />
              </rect>
              <rect x="80" y={y} width="10" height="14" fill="#a7f3d0" opacity="0.85">
                <animate attributeName="opacity" values="0.7;1;0.7" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
              </rect>
            </g>
          ))}
          
          {/* Entrance with glowing arch */}
          <path d="M50,160 Q50,145 70,145 Q90,145 90,160 Z" fill="#0d1a14" opacity="0.8" />
          <rect x="50" y="160" width="40" height="40" fill="#0d1a14" opacity="0.8" />
          <circle cx="70" cy="180" r="8" fill="#6EE7B7" opacity="0.6">
            <animate attributeName="opacity" values="0.6;0.9;0.6" dur="2s" repeatCount="indefinite" />
          </circle>
        </g>
        
        {/* Floating spell books with rotation */}
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(${60 + i * 120}, ${150 + i * 30})`}>
            <rect x="-8" y="-10" width="16" height="20" rx="2" fill="#34d399" opacity="0.7" transform={`rotate(${i * 15})`}>
              <animateTransform attributeName="transform" type="rotate" values={`${i * 15} 0 0;${i * 15 + 10} 0 0;${i * 15} 0 0`} dur="4s" repeatCount="indefinite" />
            </rect>
            <line x1="-6" y1="-5" x2="6" y2="-5" stroke="#6EE7B7" strokeWidth="1" opacity="0.8" transform={`rotate(${i * 15})`} />
            <line x1="-6" y1="0" x2="6" y2="0" stroke="#6EE7B7" strokeWidth="1" opacity="0.8" transform={`rotate(${i * 15})`} />
            <line x1="-6" y1="5" x2="6" y2="5" stroke="#6EE7B7" strokeWidth="1" opacity="0.8" transform={`rotate(${i * 15})`} />
            {/* Magical sparkles around books */}
            <circle cx="12" cy="-8" r="1.5" fill="#6EE7B7" opacity="0.8">
              <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" />
            </circle>
          </g>
        ))}
        
        {/* Floating potion bottles with bubbles */}
        {[0, 1].map((i) => (
          <g key={i} transform={`translate(${280 + i * 40}, ${220 + i * 20})`}>
            <rect x="-4" y="0" width="8" height="15" rx="1" fill="#34d399" opacity="0.6">
              <animateTransform attributeName="transform" type="translate" values="0,0; 0,-3; 0,0" dur={`${3 + i}s`} repeatCount="indefinite" />
            </rect>
            <circle cx="0" cy="-3" r="3" fill="#a7f3d0" opacity="0.7">
              <animate attributeName="opacity" values="0.7;0.9;0.7" dur="2s" repeatCount="indefinite" />
            </circle>
            {/* Bubbles rising */}
            <circle cx="2" cy="5" r="1.5" fill="#6EE7B7" opacity="0.6">
              <animateTransform attributeName="transform" type="translate" values="0,0; 2,-8; 0,0" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite" />
            </circle>
          </g>
        ))}
        
        {/* Magical energy trails */}
        <path d="M100,180 Q150,160 200,180 T300,180" stroke="#6EE7B7" strokeWidth="2" fill="none" opacity="0.4" strokeDasharray="5,5">
          <animate attributeName="stroke-dashoffset" values="0;10" dur="2s" repeatCount="indefinite" />
        </path>
        <path d="M120,250 Q170,230 220,250 T320,250" stroke="#a7f3d0" strokeWidth="1.5" fill="none" opacity="0.3" strokeDasharray="4,4">
          <animate attributeName="stroke-dashoffset" values="0;8" dur="1.5s" repeatCount="indefinite" />
        </path>
        
        {/* Wizard silhouette with animated staff */}
        <g transform="translate(180, 380)">
          <path d="M0,10 L-5,35 L5,35 L0,10 Z" fill="#0d1a14" opacity="0.9" />
          <circle cx="0" cy="8" r="4" fill="#0d1a14" opacity="0.9" />
          <path d="M-4,8 L0,-5 L4,8 Z" fill="#34d399" opacity="0.8" />
          {/* Animated staff with glowing orb */}
          <line x1="6" y1="12" x2="10" y2="-2" stroke="#34d399" strokeWidth="2" opacity="0.8" />
          <circle cx="10" cy="-2" r="3" fill="#6EE7B7" filter={`url(#glow-${uniqueId})`}>
            <animate attributeName="r" values="3;5;3" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.9;1;0.9" dur="1s" repeatCount="indefinite" />
          </circle>
        </g>
      </svg>
    );
  } else if (themeName === 'detective') {
    return (
      <svg className={styles.themeSvg} viewBox="0 0 500 500" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={`detectiveSky-${uniqueId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1a1510" />
            <stop offset="30%" stopColor="#2a2520" />
            <stop offset="70%" stopColor="#1a1510" />
            <stop offset="100%" stopColor="#0f0a08" />
          </linearGradient>
          <linearGradient id={`detectiveTopShadow-${uniqueId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.8" />
            <stop offset="30%" stopColor="#000000" stopOpacity="0.4" />
            <stop offset="60%" stopColor="#000000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`detectiveBottomShadow-${uniqueId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0" />
            <stop offset="40%" stopColor="#000000" stopOpacity="0" />
            <stop offset="70%" stopColor="#000000" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.8" />
          </linearGradient>
          <radialGradient id={`streetlightGlow-${uniqueId}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#d1b773" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#d1b773" stopOpacity="0" />
          </radialGradient>
          <filter id={`detectiveGlow-${uniqueId}`}>
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Full card background */}
        <rect width="500" height="500" fill={`url(#detectiveSky-${uniqueId})`} />
        
        {/* Black shadow at the top */}
        <rect x="0" y="0" width="500" height="200" fill={`url(#detectiveTopShadow-${uniqueId})`} />
        
        {/* Black shadow at the bottom */}
        <rect x="0" y="300" width="500" height="200" fill={`url(#detectiveBottomShadow-${uniqueId})`} />
        
        {/* Warm sepia overlay */}
        <rect width="500" height="500" fill="#d1b773" opacity="0.05">
          <animate attributeName="opacity" values="0.05;0.08;0.05" dur="5s" repeatCount="indefinite" />
        </rect>
        
        {/* Animated rain effect */}
        {[...Array(30)].map((_, i) => {
          const x = (i * 17) % 500;
          const delay = (i * 0.1) % 2;
          return (
            <line key={i} x1={x} y1="0" x2={x} y2="20" stroke="#d1b773" strokeWidth="1" opacity="0.15">
              <animate attributeName="y1" values={`${-20 + delay * 20};500`} dur="2s" repeatCount="indefinite" />
              <animate attributeName="y2" values={`${delay * 20};520`} dur="2s" repeatCount="indefinite" />
            </line>
          );
        })}
        
        {/* City skyline with animated windows - Moved upward */}
        <g>
          {/* Building 1 */}
          <rect x="0" y="200" width="80" height="220" fill="#1a1410" opacity="0.95" />
          <rect x="0" y="200" width="80" height="220" fill="#2a2015" opacity="0.5" />
          {[210, 230, 250, 270, 290, 310].map((y, i) => (
            <rect key={i} x={10 + (i % 2) * 25} y={y} width="12" height="15" fill="#d1b773" opacity="0.7">
              <animate attributeName="opacity" values="0.5;1;0.5" dur={`${2.5 + i * 0.2}s`} repeatCount="indefinite" />
            </rect>
          ))}
          
          {/* Building 2 */}
          <rect x="100" y="170" width="70" height="250" fill="#1a1410" opacity="0.9" />
          <rect x="100" y="170" width="70" height="250" fill="#2a2015" opacity="0.4" />
          {[180, 200, 220, 240, 260, 280, 300].map((y, i) => (
            <rect key={i} x={110 + (i % 2) * 30} y={y} width="12" height="15" fill="#d1b773" opacity="0.8">
              <animate attributeName="opacity" values="0.6;1;0.6" dur={`${3 + i * 0.15}s`} repeatCount="indefinite" />
            </rect>
          ))}
          
          {/* Building 3 */}
          <rect x="190" y="220" width="60" height="200" fill="#1a1410" opacity="0.95" />
          <rect x="190" y="220" width="60" height="200" fill="#2a2015" opacity="0.5" />
          {[230, 250, 270, 290, 310].map((y, i) => (
            <rect key={i} x={200 + (i % 2) * 25} y={y} width="12" height="15" fill="#d1b773" opacity="0.75">
              <animate attributeName="opacity" values="0.5;0.9;0.5" dur={`${2.8 + i * 0.2}s`} repeatCount="indefinite" />
            </rect>
          ))}
          
          {/* Building 4 - Tallest */}
          <rect x="270" y="120" width="80" height="300" fill="#1a1410" opacity="0.9" />
          <rect x="270" y="120" width="80" height="300" fill="#2a2015" opacity="0.4" />
          {[130, 150, 170, 190, 210, 230, 250, 270, 290, 310].map((y, i) => (
            <rect key={i} x={280 + (i % 2) * 30} y={y} width="12" height="15" fill="#d1b773" opacity="0.8">
              <animate attributeName="opacity" values="0.6;1;0.6" dur={`${2.2 + i * 0.1}s`} repeatCount="indefinite" />
            </rect>
          ))}
          
          {/* Building 5 */}
          <rect x="370" y="240" width="50" height="180" fill="#1a1410" opacity="0.95" />
          <rect x="370" y="240" width="50" height="180" fill="#2a2015" opacity="0.5" />
          {[250, 270, 290, 310].map((y, i) => (
            <rect key={i} x={380 + (i % 2) * 20} y={y} width="10" height="12" fill="#d1b773" opacity="0.7">
              <animate attributeName="opacity" values="0.5;0.9;0.5" dur={`${3.2 + i * 0.2}s`} repeatCount="indefinite" />
            </rect>
          ))}
          
          {/* Building 6 - Medium height */}
          <rect x="440" y="210" width="60" height="210" fill="#1a1410" opacity="0.9" />
          <rect x="440" y="210" width="60" height="210" fill="#2a2015" opacity="0.4" />
          {[220, 240, 260, 280, 300, 320].map((y, i) => (
            <rect key={i} x={450 + (i % 2) * 25} y={y} width="12" height="15" fill="#d1b773" opacity="0.75">
              <animate attributeName="opacity" values="0.5;1;0.5" dur={`${2.6 + i * 0.15}s`} repeatCount="indefinite" />
            </rect>
          ))}
          
          {/* Building 7 - Small building between others */}
          <rect x="60" y="250" width="35" height="170" fill="#1a1410" opacity="0.95" />
          <rect x="60" y="250" width="35" height="170" fill="#2a2015" opacity="0.5" />
          {[260, 280, 300].map((y, i) => (
            <rect key={i} x={68 + (i % 2) * 15} y={y} width="8" height="10" fill="#d1b773" opacity="0.65">
              <animate attributeName="opacity" values="0.4;0.8;0.4" dur={`${3.5 + i * 0.2}s`} repeatCount="indefinite" />
            </rect>
          ))}
          
          {/* Building 8 - Behind building 2 */}
          <rect x="170" y="190" width="15" height="230" fill="#0f0a08" opacity="0.98" />
          <rect x="170" y="190" width="15" height="230" fill="#1a1410" opacity="0.6" />
          {[200, 220, 240, 260, 280, 300].map((y, i) => (
            <rect key={i} x={173} y={y} width="6" height="8" fill="#d1b773" opacity="0.6">
              <animate attributeName="opacity" values="0.4;0.9;0.4" dur={`${2.8 + i * 0.15}s`} repeatCount="indefinite" />
            </rect>
          ))}
          
          {/* Building 9 - Tall narrow building */}
          <rect x="260" y="150" width="8" height="270" fill="#0f0a08" opacity="0.95" />
          <rect x="260" y="150" width="8" height="270" fill="#1a1410" opacity="0.5" />
          {[160, 180, 200, 220, 240, 260, 280, 300, 320].map((y, i) => (
            <rect key={i} x={262} y={y} width="4" height="6" fill="#d1b773" opacity="0.7">
              <animate attributeName="opacity" values="0.5;1;0.5" dur={`${2.4 + i * 0.1}s`} repeatCount="indefinite" />
            </rect>
          ))}
          
          {/* Building 10 - Small building on the right */}
          <rect x="430" y="280" width="40" height="140" fill="#1a1410" opacity="0.92" />
          <rect x="430" y="280" width="40" height="140" fill="#2a2015" opacity="0.45" />
          {[290, 310, 330].map((y, i) => (
            <rect key={i} x={440 + (i % 2) * 18} y={y} width="9" height="11" fill="#d1b773" opacity="0.68">
              <animate attributeName="opacity" values="0.45;0.85;0.45" dur={`${3.3 + i * 0.2}s`} repeatCount="indefinite" />
            </rect>
          ))}
          
          {/* Building 11 - Medium building near center */}
          <rect x="350" y="200" width="18" height="220" fill="#0f0a08" opacity="0.97" />
          <rect x="350" y="200" width="18" height="220" fill="#1a1410" opacity="0.55" />
          {[210, 230, 250, 270, 290, 310].map((y, i) => (
            <rect key={i} x={353} y={y} width="6" height="8" fill="#d1b773" opacity="0.65">
              <animate attributeName="opacity" values="0.4;0.9;0.4" dur={`${2.7 + i * 0.15}s`} repeatCount="indefinite" />
            </rect>
          ))}
        </g>
        
        {/* Animated streetlamps with pulsing glow */}
        {[90, 250, 360].map((x, i) => (
          <g key={i} transform={`translate(${x}, 240)`}>
            <line x1="0" y1="0" x2="0" y2="40" stroke="#3a2a1a" strokeWidth="4" opacity="0.9" />
            <circle cx="0" cy="0" r="8" fill="#d1b773" filter={`url(#detectiveGlow-${uniqueId})`}>
              <animate attributeName="opacity" values="0.8;1;0.8" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
            </circle>
            <ellipse cx="0" cy="0" rx="25" ry="12" fill={`url(#streetlightGlow-${uniqueId})`} opacity="0.5">
              <animate attributeName="opacity" values="0.4;0.6;0.4" dur={`${2.5 + i * 0.2}s`} repeatCount="indefinite" />
            </ellipse>
          </g>
        ))}
        
        {/* Floating clues/papers with drift animation */}
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(${80 + i * 100}, ${120 + i * 40})`} opacity="0.8">
            <rect x="0" y="0" width="20" height="28" rx="2" fill="#c9b08a" transform={`rotate(${-10 + i * 5})`}>
              <animateTransform attributeName="transform" type="translate" values="0,0; 5,-8; 0,0" dur={`${4 + i}s`} repeatCount="indefinite" />
            </rect>
            <line x1="4" y1="8" x2="16" y2="8" stroke="#1a1410" strokeWidth="1" opacity="0.6" transform={`rotate(${-10 + i * 5})`} />
            <line x1="4" y1="14" x2="14" y2="14" stroke="#1a1410" strokeWidth="1" opacity="0.6" transform={`rotate(${-10 + i * 5})`} />
            <line x1="4" y1="20" x2="12" y2="20" stroke="#1a1410" strokeWidth="1" opacity="0.6" transform={`rotate(${-10 + i * 5})`} />
          </g>
        ))}
        
        {/* Detective silhouette with animated magnifying glass */}
        <g transform="translate(200, 320)">
          <path d="M25,40 L20,80 L40,80 L35,40 Z" fill="#1a1410" opacity="0.95" />
          <path d="M23,43 L30,40 L37,43" fill="#1a1410" opacity="0.95" />
          <circle cx="30" cy="35" r="8" fill="#1a1410" opacity="0.95" />
          <ellipse cx="30" cy="32" rx="15" ry="5" fill="#1a1410" opacity="0.95" />
          <path d="M22,32 L25,24 L35,24 L38,32 Z" fill="#1a1410" opacity="0.95" />
          {/* Animated magnifying glass */}
          <circle cx="15" cy="60" r="10" fill="transparent" stroke="#e6c885" strokeWidth="3" opacity="0.9" filter={`url(#detectiveGlow-${uniqueId})`}>
            <animateTransform attributeName="transform" type="translate" values="0,0; 2,-2; 0,0" dur="3s" repeatCount="indefinite" />
          </circle>
          <line x1="10" y1="66" x2="5" y2="72" stroke="#e6c885" strokeWidth="3" opacity="0.9" />
          <circle cx="15" cy="60" r="7" fill="#d1b773" opacity="0.3" />
          <circle cx="13" cy="58" r="2" fill="#fff" opacity="0.5">
            <animate attributeName="opacity" values="0.3;0.7;0.3" dur="2s" repeatCount="indefinite" />
          </circle>
        </g>
        
        {/* Evidence markers with pulsing glow */}
        {[120, 180, 280, 340].map((x, i) => (
          <circle key={i} cx={x} cy={150 + i * 30} r="3" fill="#e6c885" filter={`url(#detectiveGlow-${uniqueId})`}>
            <animate attributeName="r" values="3;5;3" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.7;1;0.7" dur={`${1.8 + i * 0.2}s`} repeatCount="indefinite" />
          </circle>
        ))}
        
        {/* Fog/mist effect */}
        <ellipse cx="150" cy="450" rx="120" ry="30" fill="#1a1410" opacity="0.3">
          <animateTransform attributeName="transform" type="translate" values="0,0; 30,-20; 0,0" dur="10s" repeatCount="indefinite" />
        </ellipse>
        <ellipse cx="300" cy="470" rx="100" ry="25" fill="#0f0a08" opacity="0.25">
          <animateTransform attributeName="transform" type="translate" values="0,0; -25,-15; 0,0" dur="8s" repeatCount="indefinite" />
        </ellipse>
        
        {/* Minimalist Black Metal Railings at the bottom of the card - All Black */}
        <g transform="translate(0, 350)">
          {/* Black surface/platform directly beneath railing */}
          <rect x="0" y="100" width="500" height="20" fill="#000000" opacity="0.95" />
          
          {/* Top horizontal bar - Black, bigger */}
          <rect x="0" y="50" width="500" height="14" fill="#000000" opacity="0.95" />
          
          {/* Bottom horizontal bar - Black, bigger */}
          <rect x="0" y="106" width="500" height="14" fill="#000000" opacity="0.95" />
          
          {/* Vertical balusters - Evenly spaced, bigger, connecting top and bottom bars - Increased height */}
          {[20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300, 320, 340, 360, 380, 400, 420, 440, 460, 480].map((x, i) => (
            <rect key={i} x={x - 4} y="50" width="8" height="70" fill="#000000" opacity="0.95" />
          ))}
          
          {/* Black area at the bottom */}
          <rect x="0" y="120" width="500" height="160" fill="#000000" opacity="0.9" />
        </g>
      </svg>
    );
  } else if (themeName === 'space') {
    return (
      <svg className={styles.themeSvg} viewBox="0 0 500 500" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={`spaceSky-${uniqueId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0a0a1a" />
            <stop offset="30%" stopColor="#1a1a2e" />
            <stop offset="70%" stopColor="#0f0f1e" />
            <stop offset="100%" stopColor="#050510" />
          </linearGradient>
          <radialGradient id={`planetGlow-${uniqueId}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#6366f1" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`starGlow-${uniqueId}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <filter id={`spaceGlow-${uniqueId}`}>
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Full card background */}
        <rect width="500" height="500" fill={`url(#spaceSky-${uniqueId})`} />
        
        {/* Nebula effect */}
        <ellipse cx="100" cy="150" rx="120" ry="80" fill="#8b5cf6" opacity="0.15">
          <animateTransform attributeName="transform" type="translate" values="0,0; 20,10; 0,0" dur="15s" repeatCount="indefinite" />
        </ellipse>
        <ellipse cx="320" cy="200" rx="100" ry="60" fill="#ec4899" opacity="0.12">
          <animateTransform attributeName="transform" type="translate" values="0,0; -15,8; 0,0" dur="12s" repeatCount="indefinite" />
        </ellipse>
        
        {/* Animated twinkling stars */}
        {[...Array(40)].map((_, i) => {
          const x = (i * 12.5) % 500;
          const y = (i * 12.5) % 500;
          const size = 0.8 + (i % 3) * 0.4;
          return (
            <circle key={i} cx={x} cy={y} r={size} fill="#ffffff" filter={`url(#spaceGlow-${uniqueId})`}>
              <animate attributeName="opacity" values="0.4;1;0.4" dur={`${2 + (i % 4)}s`} repeatCount="indefinite" />
              <animate attributeName="r" values={`${size};${size * 1.5};${size}`} dur={`${3 + (i % 3)}s`} repeatCount="indefinite" />
            </circle>
          );
        })}
        
        {/* Large planet with rotating rings */}
        <g transform="translate(100, 120)">
          <circle cx="0" cy="0" r="50" fill={`url(#planetGlow-${uniqueId})`}>
            <animate attributeName="opacity" values="0.6;0.8;0.6" dur="4s" repeatCount="indefinite" />
          </circle>
          <circle cx="0" cy="0" r="45" fill="#6b46a8" opacity="0.5" />
          {/* Planet surface details */}
          <ellipse cx="-15" cy="-10" rx="20" ry="8" fill="#4a3a5f" opacity="0.6" transform="rotate(-20 0 0)">
            <animateTransform attributeName="transform" type="rotate" from="-20 0 0" to="340 0 0" dur="20s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="20" cy="15" rx="15" ry="6" fill="#2d1f3f" opacity="0.7" transform="rotate(30 0 0)">
            <animateTransform attributeName="transform" type="rotate" from="30 0 0" to="390 0 0" dur="25s" repeatCount="indefinite" />
          </ellipse>
          {/* Rotating rings */}
          <ellipse cx="0" cy="0" rx="65" ry="12" fill="#8b5cf6" opacity="0.3" transform="rotate(-20 0 0)">
            <animateTransform attributeName="transform" type="rotate" from="-20 0 0" to="340 0 0" dur="30s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="0" cy="0" rx="75" ry="8" fill="#6366f1" opacity="0.2" transform="rotate(10 0 0)">
            <animateTransform attributeName="transform" type="rotate" from="10 0 0" to="370 0 0" dur="40s" repeatCount="indefinite" />
          </ellipse>
        </g>
        
        {/* Moon/satellite with orbit animation */}
        <g transform="translate(300, 150)">
          <circle cx="0" cy="0" r="25" fill="#4a3a5f" opacity="0.6" />
          <circle cx="-5" cy="-5" r="6" fill="#2d1f3f" opacity="0.8" />
          <circle cx="8" cy="8" r="5" fill="#2d1f3f" opacity="0.7" />
          {/* Orbital path indicator */}
          <circle cx="0" cy="0" r="60" fill="none" stroke="#8b5cf6" strokeWidth="1" strokeDasharray="3,3" opacity="0.3">
            <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="20s" repeatCount="indefinite" />
          </circle>
        </g>
        
        {/* Animated rocket ship with thrust */}
        <g transform="translate(280, 350)" className={styles.rocketShip}>
          <path d="M25,80 L20,50 Q20,40 25,35 Q30,30 30,30 Q30,30 35,35 Q40,40 40,50 L35,80 Z" fill="#8b5cf6" opacity="0.9" />
          <circle cx="30" cy="50" r="8" fill="#ec4899" opacity="0.7" />
          <circle cx="30" cy="50" r="6" fill="#1a1a2e" opacity="0.9" />
          <path d="M20,50 L15,60 L20,55 Z" fill="#6366f1" opacity="0.8" />
          <path d="M40,50 L45,60 L40,55 Z" fill="#6366f1" opacity="0.8" />
          {/* Animated flame with pulsing */}
          <path d="M22,80 Q25,95 30,100 Q35,95 38,80 Z" fill="#ec4899" opacity="0.8">
            <animate attributeName="opacity" values="0.6;1;0.6" dur="1s" repeatCount="indefinite" />
          </path>
          <path d="M24,80 Q26,90 30,93 Q34,90 36,80 Z" fill="#f0abfc" opacity="0.9">
            <animate attributeName="opacity" values="0.7;0.4;0.7" dur="1.2s" repeatCount="indefinite" />
          </path>
          {/* Thrust particles */}
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={26 + i * 4} cy={85 + i * 3} r="2" fill="#ec4899" opacity="0.6">
              <animateTransform attributeName="transform" type="translate" values="0,0; 0,8; 0,0" dur="0.8s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.6;0;0.6" dur="0.8s" repeatCount="indefinite" />
            </circle>
          ))}
        </g>
        
        {/* Astronaut with floating animation */}
        <g transform="translate(80, 380)" className={styles.robot}>
          <rect x="20" y="50" width="25" height="40" rx="4" fill="#e0e0e0" opacity="0.4" />
          <circle cx="32.5" cy="45" r="12" fill="#f3f3f3" opacity="0.3" />
          <circle cx="32.5" cy="45" r="9" fill="#6366f1" opacity="0.5" />
          <rect x="15" y="55" width="5" height="20" rx="2" fill="#e0e0e0" opacity="0.4" />
          <rect x="45" y="55" width="5" height="20" rx="2" fill="#e0e0e0" opacity="0.4" />
          <rect x="22" y="90" width="8" height="20" rx="2" fill="#e0e0e0" opacity="0.4" />
          <rect x="35" y="90" width="8" height="20" rx="2" fill="#e0e0e0" opacity="0.4" />
          <rect x="47" y="58" width="10" height="25" rx="2" fill="#8b5cf6" opacity="0.5" />
        </g>
        
        {/* Rocky terrain with depth */}
        <path d="M0,420 Q100,400 200,410 T500,405 L500,500 L0,500 Z" fill="#1a1a2e" opacity="0.9" />
        <path d="M0,450 Q120,430 240,440 T500,435 L500,500 L0,500 Z" fill="#0f0f1e" opacity="0.95" />
        
        {/* Rocks with shadows */}
        <ellipse cx="70" cy="440" rx="20" ry="12" fill="#0a0a14" opacity="0.9" />
        <ellipse cx="220" cy="445" rx="25" ry="15" fill="#0a0a14" opacity="0.8" />
        <ellipse cx="350" cy="443" rx="22" ry="13" fill="#0a0a14" opacity="0.9" />
        
        {/* Black Space Platform/Base at the bottom - 1/8 of card (62.5px) */}
        <g transform="translate(0, 437.5)">
          {/* Main black platform - covers bottom 1/8 of card */}
          <rect x="0" y="0" width="500" height="62.5" fill="#000000" opacity="0.95" />
          <rect x="0" y="0" width="500" height="62.5" fill="#0a0a14" opacity="0.7" />
          
          {/* Platform surface details - tech panels */}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <g key={i}>
              <rect x={20 + i * 50} y="8" width="40" height="12" fill="#1a1a2e" opacity="0.6" rx="2" />
              <line x1={20 + i * 50} y1="14" x2={60 + i * 50} y2="14" stroke="#8b5cf6" strokeWidth="0.5" opacity="0.4" />
              <line x1={40 + i * 50} y1="8" x2={40 + i * 50} y2="20" stroke="#8b5cf6" strokeWidth="0.5" opacity="0.4" />
            </g>
          ))}
          
          {/* Platform edges with glow */}
          <line x1="0" y1="0" x2="500" y2="0" stroke="#8b5cf6" strokeWidth="2" opacity="0.5" />
          <line x1="0" y1="62.5" x2="500" y2="62.5" stroke="#6366f1" strokeWidth="2" opacity="0.4" />
          
          {/* Support structures/legs extending below */}
          {[100, 250, 400].map((x, i) => (
            <g key={i}>
              <rect x={x - 6} y="62.5" width="12" height="15" fill="#000000" opacity="0.9" />
              <rect x={x - 6} y="62.5" width="12" height="15" fill="#1a1a2e" opacity="0.6" />
              {/* Glowing base */}
              <ellipse cx={x} cy="77.5" rx="10" ry="3" fill="#8b5cf6" opacity="0.3">
                <animate attributeName="opacity" values="0.2;0.4;0.2" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
              </ellipse>
            </g>
          ))}
          
          {/* Tech details - small lights along top edge */}
          {[50, 150, 250, 350, 450].map((x, i) => (
            <circle key={i} cx={x} cy="5" r="2" fill="#8b5cf6" opacity="0.7">
              <animate attributeName="opacity" values="0.4;1;0.4" dur={`${1.5 + i * 0.2}s`} repeatCount="indefinite" />
            </circle>
          ))}
          
          {/* Central tech panel with details */}
          <rect x="200" y="20" width="100" height="25" fill="#1a1a2e" opacity="0.7" rx="3" />
          <line x1="220" y1="32.5" x2="280" y2="32.5" stroke="#8b5cf6" strokeWidth="1" opacity="0.5" />
          <circle cx="240" cy="32.5" r="3" fill="#8b5cf6" opacity="0.6">
            <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="260" cy="32.5" r="3" fill="#6366f1" opacity="0.6">
            <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2.3s" repeatCount="indefinite" />
          </circle>
        </g>
        
        {/* Floating space particles */}
        {[0, 1, 2, 3, 4].map((i) => (
          <circle key={i} cx={150 + i * 50} cy={200 + i * 40} r="2.5" fill="#ec4899" opacity="0.6">
            <animateTransform attributeName="transform" type="translate" values="0,0; 5,-10; 0,0" dur={`${3 + i * 0.5}s`} repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0.8;0.4" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
          </circle>
        ))}
        
        {/* Energy waves */}
        <path d="M50,300 Q150,280 250,300 T450,300" stroke="#8b5cf6" strokeWidth="2" fill="none" opacity="0.4" strokeDasharray="8,4">
          <animate attributeName="stroke-dashoffset" values="0;12" dur="3s" repeatCount="indefinite" />
        </path>
        <path d="M80,350 Q180,330 280,350 T480,350" stroke="#6366f1" strokeWidth="1.5" fill="none" opacity="0.3" strokeDasharray="6,3">
          <animate attributeName="stroke-dashoffset" values="0;9" dur="2.5s" repeatCount="indefinite" />
        </path>
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
 * @param {boolean} [props.isFeatured] - Whether this card is the featured/center card.
 * @param {Function} [props.onCardClick] - Handler for card click (to center/select it).
 */
const TopicCard = React.memo(({ topic, onClick, themeStyles = {}, comingSoon = false, retentionTestStatus = null, onRetentionTestClick = null, isFeatured = false, onCardClick = null }) => {
  const navigate = useNavigate();
  if (comingSoon) {
    return (
      <div
        className={`${themeStyles.floatCard || ""} ${themeStyles.lockedCard || ""} ${styles.immersiveCard} ${styles.comingSoonCard}`}
        style={{ position: 'relative', cursor: 'default' }}
      >
        <div className={themeStyles.lockedEffect || ""}></div>
        <div className={styles.cardContent}>
          <h2 className={styles.cardTitle}>Coming Soon</h2>
          <p className={styles.cardDesc}>New lesson cards will be available soon. Stay tuned!</p>
          <button className={styles.lockedButton} disabled>Coming Soon</button>
        </div>
      </div>
    );
  }

  const isLocked = !topic.is_unlocked;
  const progress = typeof topic.progress === 'number' ? topic.progress : 0;
  
  // Convert decimal progress (0.0-1.0) to percentage (0-100)
  const progressPercentage = Math.round(progress * 100);

  // Get theme-based progress ring color
  const getProgressRingColor = () => {
    const theme = topic.theme || 'default';
    switch (theme) {
      case 'wizard':
        return '#6EE7B7'; // Teal/aqua green (like image 1)
      case 'detective':
        return '#d1b773'; // Gold/amber
      case 'space':
        return '#8b5cf6'; // Purple/violet
      default:
        return '#8b5cf6'; // Default purple
    }
  };

  const progressRingColor = getProgressRingColor();

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
    <div
      className={`${themeStyles.floatCard || ""} ${isLocked ? themeStyles.lockedCard || "" : ""} ${styles.immersiveCard} ${isFeatured ? styles.featuredCard : styles.dimmedCard} ${topic.id === 1 ? styles.topicOneCard : ""} ${topic.id === 2 ? styles.topicTwoCard : ""} ${topic.id === 3 ? styles.topicThreeCard : ""}`}
      data-theme={topic.theme}
      data-topic-id={topic.id}
      style={{ position: 'relative' }}
      onClick={() => !isLocked && onCardClick && onCardClick()}
    >
      {/* Magical Rune Leak Effect - Only for Topic 1 */}
      {topic.id === 1 && (
        <div className={styles.runeLeakContainer}>
          <div className={styles.runeLeakTop}></div>
          <div className={styles.runeLeakBottom}></div>
          <div className={styles.runeLeakLeft}></div>
          <div className={styles.runeLeakRight}></div>
          <div className={styles.runeLeakTopRight}></div>
          <div className={styles.runeLeakTopLeft}></div>
          <div className={styles.runeLeakBottomRight}></div>
          <div className={styles.runeLeakBottomLeft}></div>
        </div>
      )}
      
      
      {/* Orbital System with Circle Stars - Only for Topic 3 */}
      {topic.id === 3 && (
        <>
          {/* Three Orbital Circles - Planets orbiting in different directions */}
          <div className={styles.orbitalSystem3D}>
            {/* Orbital Circle 1 - Clockwise, Tilted */}
            <div className={styles.orbitCircle} style={{ '--orbit-radius': '260px', '--orbit-speed': '25s', '--orbit-tilt': '45deg' }}>
              <svg className={styles.orbitPathSVG} viewBox="0 0 520 520">
                <circle 
                  cx="260" 
                  cy="260" 
                  r="260" 
                  fill="none" 
                  stroke="rgba(139, 92, 246, 0.6)" 
                  strokeWidth="2" 
                  strokeDasharray="8,4"
                />
              </svg>
              {/* Planet as SVG circle */}
              <svg className={styles.orbitalPlanet} viewBox="0 0 40 40" width="40" height="40">
                <defs>
                  <radialGradient id="planetGradient1">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
                    <stop offset="50%" stopColor="#a78bfa" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </radialGradient>
                  <filter id="planetGlow1">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                <circle cx="20" cy="20" r="18" fill="url(#planetGradient1)" filter="url(#planetGlow1)" />
                <circle cx="20" cy="20" r="14" fill="none" stroke="#6366f1" strokeWidth="1.5" opacity="0.6" />
                <circle cx="20" cy="20" r="10" fill="none" stroke="#a78bfa" strokeWidth="1" opacity="0.4" />
                <circle cx="20" cy="20" r="6" fill="#8b5cf6" opacity="0.5" />
                <circle cx="20" cy="20" r="3" fill="#ffffff" opacity="0.8" />
              </svg>
            </div>
            
            {/* Orbital Circle 2 - Counter-clockwise, Tilted */}
            <div className={`${styles.orbitCircle} ${styles.orbitCounterClockwise}`} style={{ '--orbit-radius': '320px', '--orbit-speed': '30s', '--orbit-tilt': '60deg' }}>
              <svg className={styles.orbitPathSVG} viewBox="0 0 640 640">
                <circle 
                  cx="320" 
                  cy="320" 
                  r="320" 
                  fill="none" 
                  stroke="rgba(139, 92, 246, 0.6)" 
                  strokeWidth="2" 
                  strokeDasharray="8,4"
                />
              </svg>
              {/* Planet as SVG circle */}
              <svg className={styles.orbitalPlanet} viewBox="0 0 50 50" width="50" height="50">
                <defs>
                  <radialGradient id="planetGradient2">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
                    <stop offset="50%" stopColor="#ec4899" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </radialGradient>
                  <filter id="planetGlow2">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                <circle cx="25" cy="25" r="22" fill="url(#planetGradient2)" filter="url(#planetGlow2)" />
                <circle cx="25" cy="25" r="18" fill="none" stroke="#a78bfa" strokeWidth="1.5" opacity="0.6" />
                <circle cx="25" cy="25" r="14" fill="none" stroke="#ec4899" strokeWidth="1" opacity="0.4" />
                <circle cx="25" cy="25" r="8" fill="#8b5cf6" opacity="0.5" />
                <circle cx="25" cy="25" r="4" fill="#ffffff" opacity="0.8" />
              </svg>
            </div>
            
            {/* Orbital Circle 3 - Clockwise, Tilted */}
            <div className={styles.orbitCircle} style={{ '--orbit-radius': '360px', '--orbit-speed': '35s', '--orbit-tilt': '30deg' }}>
              <svg className={styles.orbitPathSVG} viewBox="0 0 720 720">
                <circle 
                  cx="360" 
                  cy="360" 
                  r="360" 
                  fill="none" 
                  stroke="rgba(139, 92, 246, 0.6)" 
                  strokeWidth="2" 
                  strokeDasharray="8,4"
                />
              </svg>
              {/* Planet as SVG circle */}
              <svg className={styles.orbitalPlanet} viewBox="0 0 45 45" width="45" height="45">
                <defs>
                  <radialGradient id="planetGradient3">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
                    <stop offset="50%" stopColor="#6366f1" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </radialGradient>
                  <filter id="planetGlow3">
                    <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                <circle cx="22.5" cy="22.5" r="20" fill="url(#planetGradient3)" filter="url(#planetGlow3)" />
                <circle cx="22.5" cy="22.5" r="16" fill="none" stroke="#6366f1" strokeWidth="1.5" opacity="0.6" />
                <circle cx="22.5" cy="22.5" r="12" fill="none" stroke="#a78bfa" strokeWidth="1" opacity="0.4" />
                <circle cx="22.5" cy="22.5" r="7" fill="#8b5cf6" opacity="0.5" />
                <circle cx="22.5" cy="22.5" r="3.5" fill="#ffffff" opacity="0.8" />
              </svg>
            </div>
          </div>
          
          {/* Star Particles Leak Effect */}
          <div className={styles.circleStarLeakContainer}>
            {/* Top edge - Multiple star particles - More scattered */}
            {[...Array(12)].map((_, i) => {
              const size = [1, 1.5, 2, 1, 2.5, 1.5, 1, 2, 1.5, 1, 2, 1.5][i] || 1.5;
              const spread = (i - 5.5) * 35; // Wider spread
              const scatterX = (i - 5.5) * 25; // Horizontal scatter
              const scatterY = ((i % 3) - 1) * 20; // Vertical scatter variation
              return (
                <div 
                  key={`top-${i}`} 
                  className={styles.circleStarLeakTop} 
                  style={{ 
                    '--star-delay': `${i * 0.1}s`, 
                    '--star-offset': `${spread}px`,
                    '--star-scatter-x': `${scatterX}px`,
                    '--star-scatter-y': `${scatterY}px`,
                    '--star-size': `${size}px`
                  }}
                ></div>
              );
            })}
            {/* Bottom edge - Multiple star particles - More scattered */}
            {[...Array(12)].map((_, i) => {
              const size = [2, 1, 1.5, 2.5, 1, 2, 1.5, 1, 2, 1.5, 1, 2][i] || 1.5;
              const spread = (i - 5.5) * 35; // Wider spread
              const scatterX = (i - 5.5) * 25; // Horizontal scatter
              const scatterY = ((i % 3) - 1) * 20; // Vertical scatter variation
              return (
                <div 
                  key={`bottom-${i}`} 
                  className={styles.circleStarLeakBottom} 
                  style={{ 
                    '--star-delay': `${i * 0.1}s`, 
                    '--star-offset': `${spread}px`,
                    '--star-scatter-x': `${scatterX}px`,
                    '--star-scatter-y': `${scatterY}px`,
                    '--star-size': `${size}px`
                  }}
                ></div>
              );
            })}
            {/* Left edge - Multiple star particles - More scattered */}
            {[...Array(10)].map((_, i) => {
              const size = [1.5, 2, 1, 2.5, 1, 1.5, 2, 1, 1.5, 2][i] || 1.5;
              const spread = (i - 4.5) * 30; // Wider spread
              const scatterX = ((i % 3) - 1) * 20; // Horizontal scatter variation
              const scatterY = (i - 4.5) * 25; // Vertical scatter
              return (
                <div 
                  key={`left-${i}`} 
                  className={styles.circleStarLeakLeft} 
                  style={{ 
                    '--star-delay': `${i * 0.15}s`, 
                    '--star-offset': `${spread}px`,
                    '--star-scatter-x': `${scatterX}px`,
                    '--star-scatter-y': `${scatterY}px`,
                    '--star-size': `${size}px`
                  }}
                ></div>
              );
            })}
            {/* Right edge - Multiple star particles - More scattered */}
            {[...Array(10)].map((_, i) => {
              const size = [2, 1, 2.5, 1.5, 1, 2, 1.5, 2, 1, 1.5][i] || 1.5;
              const spread = (i - 4.5) * 30; // Wider spread
              const scatterX = ((i % 3) - 1) * 20; // Horizontal scatter variation
              const scatterY = (i - 4.5) * 25; // Vertical scatter
              return (
                <div 
                  key={`right-${i}`} 
                  className={styles.circleStarLeakRight} 
                  style={{ 
                    '--star-delay': `${i * 0.15}s`, 
                    '--star-offset': `${spread}px`,
                    '--star-scatter-x': `${scatterX}px`,
                    '--star-scatter-y': `${scatterY}px`,
                    '--star-size': `${size}px`
                  }}
                ></div>
              );
            })}
            {/* Corners - Star particles */}
            <div className={styles.circleStarLeakTopRight}></div>
            <div className={styles.circleStarLeakTopLeft}></div>
            <div className={styles.circleStarLeakBottomRight}></div>
            <div className={styles.circleStarLeakBottomLeft}></div>
          </div>
        </>
      )}
      
      {/* Themed SVG Background - Fills entire card */}
      {renderThemeBackground(topic.theme, topic.id)}
      
      <div
        className={`${themeStyles.holographicEffect || ""} ${isLocked ? themeStyles.lockedEffect || "" : ""}`}
      ></div>
      <div className={styles.cardContent}>
        {/* Circular Progress Ring */}
        <div className={styles.progressRingContainer}>
          <svg className={styles.progressRing} viewBox="0 0 140 140">
            {/* Background circle */}
            <circle
              className={styles.progressRingBg}
              cx="70"
              cy="70"
              r="62"
              fill="none"
              strokeWidth="10"
            />
            {/* Progress circle */}
            <circle
              className={styles.progressRingFill}
              cx="70"
              cy="70"
              r="62"
              fill="none"
              strokeWidth="10"
              strokeDasharray={`${2 * Math.PI * 62}`}
              strokeDashoffset={`${2 * Math.PI * 62 * (1 - progress)}`}
              style={{
                stroke: progressRingColor,
                transform: 'rotate(-90deg)',
                transformOrigin: '70px 70px'
              }}
            />
          </svg>
          <div className={styles.progressPercentage}>
            <span className={styles.progressNumber}>{progressPercentage}</span>
            <span className={styles.progressPercent}>%</span>
          </div>
        </div>
        
        <h2 className={styles.cardTitle}>{topic.name}</h2>
        <p className={styles.cardDesc}>{topic.description}</p>
        <button
          className={`${styles.startButton} ${isLocked ? styles.lockedButton : ""}`}
          disabled={isLocked}
          onClick={(e) => {
            e.stopPropagation(); // Prevent card click when button is clicked
            buttonAction();
          }}
        >
          {buttonLabel}
        </button>
        
      </div>
      
      {/* Retention Test Summary Icon - Upper Right Corner (Red Circle Location) */}
        {retentionTestStatus && retentionTestStatus.availability && (retentionTestStatus.availability.first_stage_completed || retentionTestStatus.availability.second_stage_completed) && (
              <button
          className={styles.retentionTestIcon}
          onClick={(e) => {
            e.stopPropagation();
            onRetentionTestClick && onRetentionTestClick(topic, true);
          }}
          title="View Retention Test Summary"
          aria-label="Retention Test Completed - Click to view summary"
        >
          <span className={styles.iconSymbol}>📊</span>
          {retentionTestStatus.availability.first_stage_completed && retentionTestStatus.availability.second_stage_completed && (
            <span className={styles.completedIndicator}>✓</span>
          )}
              </button>
        )}
        
      {isLocked && <div className={styles.lockedIcon}>🔒</div>}
    </div>
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
  isFeatured: PropTypes.bool,
};

export default TopicCard;
