import React, { useRef } from "react";
import Editor from "@monaco-editor/react";
import { useParams } from 'react-router-dom';
import { useMemo, useEffect } from 'react';
import { subtopicContent } from '../../mydeck/content/subtopicContent';
// Import theme modules
import wizardTheme from '../themes/wizardTheme.module.scss';
import detectiveTheme from '../themes/detectiveTheme.module.scss';
import spaceTheme from '../themes/spaceTheme.module.scss';

const getMonacoThemeName = (appTheme) => {
  switch (appTheme) {
    case 'wizard': return 'wizard-theme';
    case 'detective': return 'detective-theme';
    default: return 'space-theme';
  }
};

const defineMonacoThemes = (monaco) => {
  if (monaco.__cloveThemesDefined) return;
  
  console.log('LessonMonacoEditor - Defining Monaco themes...');
  
  // Space Theme - Using actual colors from spaceTheme.module.scss
  monaco.editor.defineTheme('space-theme', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: '', foreground: 'ffffff', background: '0a0a1a' }, // theme-text: #ffffff
      { token: 'keyword', foreground: '6c5ce7' }, // code-keyword: #6c5ce7
      { token: 'string', foreground: 'ff7675' }, // code-string: #ff7675
      { token: 'number', foreground: 'a6aafb' }, // code-number: #a6aafb
      { token: 'comment', foreground: 'a8a5e6' }, // code-comment: #a8a5e6
      { token: 'type.identifier.java', foreground: 'a6aafb' }, // code-variable: #a6aafb
      { token: 'variable', foreground: 'a6aafb' }, // code-variable: #a6aafb
    ],
    colors: {
      'editor.background': '#0a0a1a', // theme-bg: #0a0a1a
      'editor.foreground': '#ffffff', // theme-text: #ffffff
      'editor.lineHighlightBackground': '#252540', // code-bg: #252540
      'editorCursor.foreground': '#6c5ce7', // accent-primary: #6c5ce7
      'editorLineNumber.foreground': '#a8a5e6', // text-muted: #a8a5e6
      'editor.selectionBackground': '#3e3e5e', // accent-active: #3e3e5e
      'editor.inactiveSelectionBackground': '#3e3e5e70',
    }
  });
  
  // Wizard Theme - Using actual colors from wizardTheme.module.scss
  monaco.editor.defineTheme('wizard-theme', {
    base: 'vs-dark',
    inherit: false, // Don't inherit to have full control
    rules: [
      { token: '', foreground: 'E8DBC3', background: '0F172A' }, // theme-text: #E8DBC3, theme-bg: #0F172A
      { token: 'keyword', foreground: 'FBBF24' }, // code-keyword: #FBBF24 (Enchanted Gold Bright)
      { token: 'string', foreground: 'E8DBC3' }, // code-string: #E8DBC3 (Aged Parchment)
      { token: 'number', foreground: '06B6D4' }, // code-number: #06B6D4 (Arcane Turquoise Deep)
      { token: 'comment', foreground: 'E8DBC3' }, // code-comment: #E8DBC3 (Aged Parchment)
      { token: 'type.identifier.java', foreground: '0EA5E9' }, // code-variable: #0EA5E9 (Arcane Turquoise Bright)
      { token: 'variable', foreground: '0EA5E9' }, // code-variable: #0EA5E9 (Arcane Turquoise Bright)
      { token: 'operator', foreground: 'E8DBC3' }, // theme-text: #E8DBC3 (Aged Parchment)
      { token: 'delimiter', foreground: 'E8DBC3' }, // theme-text: #E8DBC3 (Aged Parchment)
      { token: 'constant', foreground: '06B6D4' }, // code-number: #06B6D4 (Arcane Turquoise Deep)
      { token: 'function', foreground: 'FBBF24' }, // code-keyword: #FBBF24 (Enchanted Gold Bright)
      { token: 'class', foreground: '0EA5E9' }, // code-variable: #0EA5E9 (Arcane Turquoise Bright)
      { token: 'type', foreground: '0EA5E9' }, // code-variable: #0EA5E9 (Arcane Turquoise Bright)
      { token: 'namespace', foreground: '0EA5E9' }, // code-variable: #0EA5E9 (Arcane Turquoise Bright)
      { token: 'parameter', foreground: '0EA5E9' }, // code-variable: #0EA5E9 (Arcane Turquoise Bright)
      { token: 'property', foreground: '0EA5E9' }, // code-variable: #0EA5E9 (Arcane Turquoise Bright)
      { token: 'enum', foreground: '0EA5E9' }, // code-variable: #0EA5E9 (Arcane Turquoise Bright)
      { token: 'enumMember', foreground: '06B6D4' }, // code-number: #06B6D4 (Arcane Turquoise Deep)
      { token: 'interface', foreground: '0EA5E9' }, // code-variable: #0EA5E9 (Arcane Turquoise Bright)
      { token: 'typeParameter', foreground: '0EA5E9' }, // code-variable: #0EA5E9 (Arcane Turquoise Bright)
      { token: 'decorator', foreground: 'FBBF24' }, // code-keyword: #FBBF24 (Enchanted Gold Bright)
      { token: 'annotation', foreground: 'FBBF24' }, // code-keyword: #FBBF24 (Enchanted Gold Bright)
      { token: 'modifier', foreground: 'FBBF24' }, // code-keyword: #FBBF24 (Enchanted Gold Bright)
      { token: 'control', foreground: 'FBBF24' }, // code-keyword: #FBBF24 (Enchanted Gold Bright)
      { token: 'entity', foreground: '0EA5E9' }, // code-variable: #0EA5E9 (Arcane Turquoise Bright)
      { token: 'invalid', foreground: 'EF4444', background: '0F172A' }, // Error color
      { token: 'regexp', foreground: 'E8DBC3' }, // theme-text: #E8DBC3 (Aged Parchment)
      { token: 'meta', foreground: '0EA5E9' }, // code-variable: #0EA5E9 (Arcane Turquoise Bright)
      { token: 'punctuation', foreground: 'E8DBC3' }, // theme-text: #E8DBC3 (Aged Parchment)
      { token: 'bracket', foreground: 'E8DBC3' }, // theme-text: #E8DBC3 (Aged Parchment)
      { token: 'brace', foreground: 'E8DBC3' }, // theme-text: #E8DBC3 (Aged Parchment)
      { token: 'parenthesis', foreground: 'E8DBC3' }, // theme-text: #E8DBC3 (Aged Parchment)
      { token: 'squareBracket', foreground: 'E8DBC3' }, // theme-text: #E8DBC3 (Aged Parchment)
      { token: 'angleBracket', foreground: 'E8DBC3' }, // theme-text: #E8DBC3 (Aged Parchment)
      { token: 'curlyBracket', foreground: 'E8DBC3' }, // theme-text: #E8DBC3 (Aged Parchment)
      { token: 'identifier', foreground: '0EA5E9' }, // code-variable: #0EA5E9 (Arcane Turquoise Bright)
      { token: 'member', foreground: '0EA5E9' }, // code-variable: #0EA5E9 (Arcane Turquoise Bright)
      { token: 'method', foreground: '0EA5E9' }, // code-variable: #0EA5E9 (Arcane Turquoise Bright)
      { token: 'field', foreground: '0EA5E9' }, // code-variable: #0EA5E9 (Arcane Turquoise Bright)
      { token: 'constructor', foreground: '0EA5E9' }, // code-variable: #0EA5E9 (Arcane Turquoise Bright)
      { token: 'destructuring', foreground: '0EA5E9' }, // code-variable: #0EA5E9 (Arcane Turquoise Bright)
      { token: 'label', foreground: 'FBBF24' }, // code-keyword: #FBBF24 (Enchanted Gold Bright)
      { token: 'unit', foreground: '06B6D4' }, // code-number: #06B6D4 (Arcane Turquoise Deep)
      { token: 'boolean', foreground: 'FBBF24' }, // code-keyword: #FBBF24 (Enchanted Gold Bright)
      { token: 'null', foreground: 'FBBF24' }, // code-keyword: #FBBF24 (Enchanted Gold Bright)
      { token: 'undefined', foreground: 'FBBF24' }, // code-keyword: #FBBF24 (Enchanted Gold Bright)
      { token: 'this', foreground: 'FBBF24' }, // code-keyword: #FBBF24 (Enchanted Gold Bright)
      { token: 'super', foreground: 'FBBF24' }, // code-keyword: #FBBF24 (Enchanted Gold Bright)
      { token: 'new', foreground: 'FBBF24' }, // code-keyword: #FBBF24 (Enchanted Gold Bright)
      { token: 'return', foreground: 'FBBF24' }, // code-keyword: #FBBF24 (Enchanted Gold Bright)
      { token: 'throw', foreground: 'FBBF24' }, // code-keyword: #FBBF24 (Enchanted Gold Bright)
      { token: 'try', foreground: 'FBBF24' }, // code-keyword: #FBBF24 (Enchanted Gold Bright)
      { token: 'catch', foreground: 'FBBF24' }, // code-keyword: #FBBF24 (Enchanted Gold Bright)
      { token: 'finally', foreground: 'FBBF24' }, // code-keyword: #FBBF24 (Enchanted Gold Bright)
      { token: 'if', foreground: 'FBBF24' }, // code-keyword: #FBBF24 (Enchanted Gold Bright)
      { token: 'else', foreground: 'FBBF24' }, // code-keyword: #FBBF24 (Enchanted Gold Bright)
      { token: 'switch', foreground: 'FBBF24' }, // code-keyword: #FBBF24 (Enchanted Gold Bright)
      { token: 'case', foreground: 'FBBF24' }, // code-keyword: #FBBF24 (Enchanted Gold Bright)
      { token: 'default', foreground: 'FBBF24' }, // code-keyword: #FBBF24 (Enchanted Gold Bright)
      { token: 'for', foreground: 'FBBF24' }, // code-keyword: #FBBF24 (Enchanted Gold Bright)
      { token: 'while', foreground: 'FBBF24' }, // code-keyword: #FBBF24 (Enchanted Gold Bright)
      { token: 'do', foreground: 'FBBF24' }, // code-keyword: #FBBF24 (Enchanted Gold Bright)
      { token: 'break', foreground: 'FBBF24' }, // code-keyword: #FBBF24 (Enchanted Gold Bright)
      { token: 'continue', foreground: 'FBBF24' }, // code-keyword: #FBBF24 (Enchanted Gold Bright)
      { token: 'import', foreground: 'FBBF24' }, // code-keyword: #FBBF24 (Enchanted Gold Bright)
      { token: 'export', foreground: 'FBBF24' }, // code-keyword: #FBBF24 (Enchanted Gold Bright)
      { token: 'package', foreground: 'FBBF24' }, // code-keyword: #FBBF24 (Enchanted Gold Bright)
      { token: 'extends', foreground: 'FBBF24' }, // code-keyword: #FBBF24 (Enchanted Gold Bright)
      { token: 'implements', foreground: 'FBBF24' }, // code-keyword: #FBBF24 (Enchanted Gold Bright)
      { token: 'interface', foreground: 'FBBF24' }, // code-keyword: #FBBF24 (Enchanted Gold Bright)
      { token: 'abstract', foreground: 'FBBF24' }, // code-keyword: #FBBF24 (Enchanted Gold Bright)
      { token: 'final', foreground: 'FBBF24' }, // code-keyword: #FBBF24 (Enchanted Gold Bright)
      { token: 'static', foreground: 'FBBF24' }, // code-keyword: #FBBF24 (Enchanted Gold Bright)
      { token: 'public', foreground: 'FBBF24' }, // code-keyword: #FBBF24 (Enchanted Gold Bright)
      { token: 'private', foreground: 'FBBF24' }, // code-keyword: #FBBF24 (Enchanted Gold Bright)
      { token: 'protected', foreground: 'FBBF24' }, // code-keyword: #FBBF24 (Enchanted Gold Bright)
      { token: 'synchronized', foreground: 'FBBF24' }, // code-keyword: #FBBF24 (Enchanted Gold Bright)
      { token: 'volatile', foreground: 'FBBF24' }, // code-keyword: #FBBF24 (Enchanted Gold Bright)
      { token: 'transient', foreground: 'FBBF24' }, // code-keyword: #FBBF24 (Enchanted Gold Bright)
      { token: 'native', foreground: 'FBBF24' }, // code-keyword: #FBBF24 (Enchanted Gold Bright)
      { token: 'strictfp', foreground: 'FBBF24' }, // code-keyword: #FBBF24 (Enchanted Gold Bright)
      { token: 'instanceof', foreground: 'FBBF24' }, // code-keyword: #FBBF24 (Enchanted Gold Bright)
      { token: 'assert', foreground: 'FBBF24' }, // code-keyword: #FBBF24 (Enchanted Gold Bright)
      { token: 'enum', foreground: 'FBBF24' }, // code-keyword: #FBBF24 (Enchanted Gold Bright)
      { token: 'const', foreground: 'FBBF24' }, // code-keyword: #FBBF24 (Enchanted Gold Bright)
      { token: 'goto', foreground: 'FBBF24' }, // code-keyword: #FBBF24 (Enchanted Gold Bright)
      { token: 'var', foreground: 'FBBF24' }, // code-keyword: #FBBF24 (Enchanted Gold Bright)
      { token: 'let', foreground: 'FBBF24' }, // code-keyword: #FBBF24 (Enchanted Gold Bright)
      { token: 'function', foreground: 'FBBF24' }, // code-keyword: #FBBF24 (Enchanted Gold Bright)
      { token: 'class', foreground: 'FBBF24' }, // code-keyword: #FBBF24 (Enchanted Gold Bright)
      { token: 'interface', foreground: 'FBBF24' }, // code-keyword: #FBBF24 (Enchanted Gold Bright)
      { token: 'type', foreground: 'FBBF24' }, // code-keyword: #FBBF24 (Enchanted Gold Bright)
      { token: 'namespace', foreground: 'FBBF24' }, // code-keyword: #FBBF24 (Enchanted Gold Bright)
      { token: 'module', foreground: 'FBBF24' }, // code-keyword: #FBBF24 (Enchanted Gold Bright)
      { token: 'async', foreground: 'FBBF24' }, // code-keyword: #FBBF24 (Enchanted Gold Bright)
      { token: 'await', foreground: 'FBBF24' }, // code-keyword: #FBBF24 (Enchanted Gold Bright)
      { token: 'yield', foreground: 'FBBF24' }, // code-keyword: #FBBF24 (Enchanted Gold Bright)
      { token: 'generator', foreground: 'FBBF24' }, // code-keyword: #FBBF24 (Enchanted Gold Bright)
      { token: 'decorator', foreground: 'FBBF24' }, // code-keyword: #FBBF24 (Enchanted Gold Bright)
      { token: 'annotation', foreground: 'FBBF24' }, // code-keyword: #FBBF24 (Enchanted Gold Bright)
      { token: 'modifier', foreground: 'FBBF24' }, // code-keyword: #FBBF24 (Enchanted Gold Bright)
      { token: 'control', foreground: 'FBBF24' }, // code-keyword: #FBBF24 (Enchanted Gold Bright)
      { token: 'entity', foreground: '0EA5E9' }, // code-variable: #0EA5E9 (Arcane Turquoise Bright)
      { token: 'invalid', foreground: 'EF4444', background: '0F172A' }, // Error color
    ],
    colors: {
      'editor.background': '#0F172A', // theme-bg: #0F172A (Deep Twilight Blue)
      'editor.foreground': '#E8DBC3', // theme-text: #E8DBC3 (Aged Parchment)
      'editor.lineHighlightBackground': '#1A2B3C', // card-bg: #1A2B3C (Deep Navy)
      'editorCursor.foreground': '#FBBF24', // gold-accent: #FBBF24 (Enchanted Gold Bright)
      'editorLineNumber.foreground': '#6B7280', // text-secondary: #6B7280 (Ancient Stone Light)
      'editor.selectionBackground': '#0EA5E9', // accent-primary: #0EA5E9 (Arcane Turquoise Bright)
      'editor.inactiveSelectionBackground': '#0EA5E970',
      'editorWhitespace.foreground': '#6B7280',
      'editorIndentGuide.background': '#6B7280',
      'editorIndentGuide.activeBackground': '#0EA5E9',
      'editor.selectionHighlightBackground': '#0EA5E933',
      'editor.wordHighlightBackground': '#0EA5E933',
      'editor.wordHighlightStrongBackground': '#FBBF2433',
      'editorBracketMatch.background': '#0EA5E955',
      'editorBracketMatch.border': '#6B7280',
      'editorError.foreground': '#EF4444',
      'editorWarning.foreground': '#FBBF24',
      'editorInfo.foreground': '#0EA5E9',
      'editorGutter.background': '#0F172A',
      'editorGutter.modifiedBackground': '#FBBF24',
      'editorGutter.addedBackground': '#0EA5E9',
      'editorGutter.deletedBackground': '#EF4444',
      'editorWidget.background': '#1A2B3C',
      'editorWidget.border': 'rgba(255,255,255,0.05)',
      'editorSuggestWidget.background': '#1A2B3C',
      'editorSuggestWidget.border': 'rgba(255,255,255,0.05)',
      'editorSuggestWidget.foreground': '#E8DBC3',
      'editorSuggestWidget.selectedBackground': '#0EA5E9',
      'editorHoverWidget.background': '#1A2B3C',
      'editorHoverWidget.border': 'rgba(255,255,255,0.05)',
      'editorMarkerNavigation.background': '#0F172A',
      'editorMarkerNavigationError.background': '#EF4444',
      'editorMarkerNavigationWarning.background': '#FBBF24',
      'editorMarkerNavigationInfo.background': '#0EA5E9',
      'editorOverviewRuler.border': 'rgba(255,255,255,0.05)',
      'editorOverviewRuler.errorForeground': '#EF4444',
      'editorOverviewRuler.warningForeground': '#FBBF24',
      'editorOverviewRuler.infoForeground': '#0EA5E9',
      'editorWidget.shadow': '0 2px 8px rgba(0,0,0,0.5)',
    }
  });
  
  // Detective/Noir Theme - Using actual colors from detectiveTheme.module.scss
  monaco.editor.defineTheme('detective-theme', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: '', foreground: 'dcdcdc', background: '121212' }, // theme-text: #dcdcdc, theme-bg: #121212
      { token: 'keyword', foreground: 'd1b773', fontStyle: 'bold' }, // code-keyword: #d1b773
      { token: 'string', foreground: 'cdaa7d' }, // code-string: #cdaa7d
      { token: 'number', foreground: 'cdaa7d' }, // code-number: #cdaa7d
      { token: 'comment', foreground: 'b4a287', fontStyle: 'italic' }, // code-comment: #b4a287
      { token: 'type.identifier.java', foreground: '7a9e7e' }, // code-variable: #7a9e7e
      { token: 'variable', foreground: '7a9e7e' }, // code-variable: #7a9e7e
      { token: 'invalid', foreground: '8C3B3B', background: '2C2C2C' },
      { token: 'delimiter', foreground: '444444' },
      { token: 'operator', foreground: 'd1b773' }, // code-keyword: #d1b773
      { token: 'constant', foreground: 'cdaa7d' }, // code-string: #cdaa7d
      { token: 'function', foreground: 'd1b773' }, // code-keyword: #d1b773
      { token: 'regexp', foreground: 'b4a287' }, // code-comment: #b4a287
      { token: 'meta', foreground: '3c4c5a' }, // accent-active: #3c4c5a
    ],
    colors: {
      'editor.background': '#121212', // theme-bg: #121212
      'editor.foreground': '#dcdcdc', // theme-text: #dcdcdc
      'editor.lineHighlightBackground': '#2a2a3a', // code-bg: #2a2a3a
      'editor.selectionBackground': '#3c4c5a55', // accent-active: #3c4c5a with opacity
      'editor.inactiveSelectionBackground': '#44444433',
      'editorCursor.foreground': '#d1b773', // code-keyword: #d1b773
      'editorLineNumber.foreground': '#b4a287', // code-comment: #b4a287
      'editorLineNumber.activeForeground': '#d1b773', // code-keyword: #d1b773
      'editorWhitespace.foreground': '#444444',
      'editorIndentGuide.background': '#444444',
      'editorIndentGuide.activeBackground': '#7a9e7e', // code-variable: #7a9e7e
      'editor.selectionHighlightBackground': '#3c4c5a33', // accent-active: #3c4c5a with opacity
      'editor.wordHighlightBackground': '#7a9e7e33', // code-variable: #7a9e7e with opacity
      'editor.wordHighlightStrongBackground': '#d1b77333', // code-keyword: #d1b773 with opacity
      'editorBracketMatch.background': '#3c4c5a55', // accent-active: #3c4c5a with opacity
      'editorBracketMatch.border': '#444444',
      'editorError.foreground': '#8C3B3B',
      'editorWarning.foreground': '#d1b773', // code-keyword: #d1b773
      'editorInfo.foreground': '#7a9e7e', // code-variable: #7a9e7e
      'editorGutter.background': '#121212', // theme-bg: #121212
      'editorGutter.modifiedBackground': '#d1b773', // code-keyword: #d1b773
      'editorGutter.addedBackground': '#7a9e7e', // code-variable: #7a9e7e
      'editorGutter.deletedBackground': '#8C3B3B',
      'editorWidget.background': '#2a2a3a', // code-bg: #2a2a3a
      'editorWidget.border': 'rgba(255,255,255,0.05)',
      'editorSuggestWidget.background': '#2a2a3a', // code-bg: #2a2a3a
      'editorSuggestWidget.border': 'rgba(255,255,255,0.05)',
      'editorSuggestWidget.foreground': '#dcdcdc', // theme-text: #dcdcdc
      'editorSuggestWidget.selectedBackground': '#3c4c5a', // accent-active: #3c4c5a
      'editorHoverWidget.background': '#2a2a3a', // code-bg: #2a2a3a
      'editorHoverWidget.border': 'rgba(255,255,255,0.05)',
      'editorMarkerNavigation.background': '#121212', // theme-bg: #121212
      'editorMarkerNavigationError.background': '#8C3B3B',
      'editorMarkerNavigationWarning.background': '#d1b773', // code-keyword: #d1b773
      'editorMarkerNavigationInfo.background': '#7a9e7e', // code-variable: #7a9e7e
      'editorOverviewRuler.border': 'rgba(255,255,255,0.05)',
      'editorOverviewRuler.errorForeground': '#8C3B3B',
      'editorOverviewRuler.warningForeground': '#d1b773', // code-keyword: #d1b773
      'editorOverviewRuler.infoForeground': '#7a9e7e', // code-variable: #7a9e7e
      'editorWidget.shadow': '0 2px 8px rgba(0,0,0,0.5)',
    }
  });
  
  console.log('LessonMonacoEditor - All themes defined successfully');
  monaco.__cloveThemesDefined = true;
};

const LessonMonacoEditor = ({
  value,
  onChange,
  language = "java",
  height = "400px",
  options = {},
  onMount: customOnMount,
  ...rest
}) => {
  const editorRef = useRef(null);
  const { topicId } = useParams();

  // Get theme from topic ID automatically (same logic as LessonThemeProvider)
  const currentTheme = useMemo(() => {
    if (topicId) {
      // Extract the numeric part from topicId (e.g., "1-data-types-and-variables" -> "1")
      const numericTopicId = topicId.split('-')[0];
      const topic = subtopicContent[numericTopicId];
      console.log('LessonMonacoEditor - Parsed topicId:', numericTopicId, 'from:', topicId);
      return topic ? topic.theme : 'space';
    }
    return 'space'; // Default to space theme
  }, [topicId, subtopicContent]);

  // Get the parsed topicId for consistent use
  const parsedTopicId = useMemo(() => {
    return topicId ? topicId.split('-')[0] : null;
  }, [topicId]);

  const handleMount = (editor, monaco) => {
    editorRef.current = editor;
    defineMonacoThemes(monaco);
    
    // Debug logging
    console.log('LessonMonacoEditor - Current theme:', currentTheme);
    console.log('LessonMonacoEditor - Topic ID:', topicId);
    console.log('LessonMonacoEditor - Monaco theme name:', getMonacoThemeName(currentTheme));
    console.log('LessonMonacoEditor - Subtopic content for topicId:', subtopicContent[parsedTopicId]);
    
    // Set the theme
    const themeName = getMonacoThemeName(currentTheme);
    console.log('LessonMonacoEditor - Setting Monaco theme to:', themeName);
    monaco.editor.setTheme(themeName);
    
    // Force a refresh of the editor to ensure theme is applied
    setTimeout(() => {
      editor.updateOptions({});
      console.log('LessonMonacoEditor - Editor refreshed');
    }, 100);
    
    if (customOnMount) {
      customOnMount(editor, monaco);
    }
  };

  // Add theme-specific container styling
  const containerStyle = currentTheme === 'detective' ? {
    borderRadius: 6,
    boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.05)',
    background: '#232323',
  } : {};

  return (
    <div style={containerStyle}>
      <Editor
        height={height}
        defaultLanguage={language}
        value={value}
        onChange={onChange}
        options={{
          minimap: { enabled: false },
          fontSize: 16,
          wordWrap: 'on',
          automaticLayout: true,
          scrollBeyondLastLine: false,
          renderWhitespace: 'selection',
          formatOnPaste: true,
          formatOnType: true,
          lineNumbers: 'on',
          folding: true,
          lineDecorationsWidth: 10,
          padding: { top: 15, bottom: 15, left: 0 },
          tabSize: 2,
          fontFamily: currentTheme === 'detective' ? 'IBM Plex Mono, monospace' : 
                     currentTheme === 'wizard' ? 'JetBrains Mono, Fira Code, monospace' : 
                     'Fira Code, monospace',
          fontWeight: '400',
          lineHeight: 24,
          glyphMargin: false,
          lineNumbersMinChars: 3,
          renderLineHighlight: 'all',
          scrollbar: {
            vertical: 'hidden',
            horizontal: 'hidden',
            useShadows: false,
            verticalHasArrows: false,
            horizontalHasArrows: false,
            verticalScrollbarSize: 0,
            horizontalScrollbarSize: 0,
          },
          ...options,
        }}
        onMount={handleMount}
        {...rest}
      />
    </div>
  );
};

export default LessonMonacoEditor; 