import React, { useRef } from "react";
import Editor from "@monaco-editor/react";
import { useParams } from 'react-router-dom';
import { useMemo, useEffect } from 'react';
import { subtopicContent } from '../../mydeck/content/subtopicContent';
// Theme imports removed - using centralized theme system

const getMonacoThemeName = (appTheme) => {
  switch (appTheme) {
    case 'wizard': return 'wizard-theme';
    case 'detective': return 'detective-theme';
    default: return 'space-theme';
  }
};

// Use WeakMap to track which monaco instances have had themes defined
// This avoids the "object is not extensible" error
const monacoThemesDefined = new WeakMap();

const defineMonacoThemes = (monaco) => {
  if (monacoThemesDefined.has(monaco)) return;
  
  monaco.editor.defineTheme('space-theme', {
    base: 'vs-dark',
    inherit: false,
    rules: [
      { token: '', foreground: 'ffffff', background: '0a0a1a' },
      { token: 'keyword', foreground: '6c5ce7' },
      { token: 'string', foreground: 'ff7675' },
      { token: 'number', foreground: 'a6aafb' },
      { token: 'comment', foreground: 'a8a5e6' },
      { token: 'type.identifier.java', foreground: 'a6aafb' },
      { token: 'variable', foreground: 'a6aafb' },
    ],
    colors: {
      'editor.background': '#0a0a1a',
      'editor.foreground': '#ffffff',
      'editor.lineHighlightBackground': '#252540',
      'editorCursor.foreground': '#6c5ce7',
      'editorLineNumber.foreground': '#a8a5e6',
      'editor.selectionBackground': '#3e3e5e',
      'editor.inactiveSelectionBackground': '#3e3e5e70',
      'editorWhitespace.foreground': '#a8a5e6',
      'editorIndentGuide.background': '#a8a5e6',
      'editorIndentGuide.activeBackground': '#6c5ce7',
      'editor.selectionHighlightBackground': '#3e3e5e33',
      'editor.wordHighlightBackground': '#3e3e5e33',
      'editor.wordHighlightStrongBackground': '#6c5ce733',
      'editorBracketMatch.background': '#3e3e5e55',
      'editorBracketMatch.border': '#a8a5e6',
      'editorError.foreground': '#ff7675',
      'editorWarning.foreground': '#fdcb6e',
      'editorInfo.foreground': '#6c5ce7',
      'editorGutter.background': '#0a0a1a',
      'editorGutter.modifiedBackground': '#6c5ce7',
      'editorGutter.addedBackground': '#00b894',
      'editorGutter.deletedBackground': '#ff7675',
      'editorWidget.background': '#252540',
      'editorWidget.border': 'rgba(255,255,255,0.05)',
      'editorSuggestWidget.background': '#252540',
      'editorSuggestWidget.border': 'rgba(255,255,255,0.05)',
      'editorSuggestWidget.foreground': '#ffffff',
      'editorSuggestWidget.selectedBackground': '#3e3e5e',
      'editorHoverWidget.background': '#252540',
      'editorHoverWidget.border': 'rgba(255,255,255,0.05)',
      'editorMarkerNavigation.background': '#0a0a1a',
      'editorMarkerNavigationError.background': '#ff7675',
      'editorMarkerNavigationWarning.background': '#fdcb6e',
      'editorMarkerNavigationInfo.background': '#6c5ce7',
      'editorOverviewRuler.border': 'rgba(255,255,255,0.05)',
      'editorOverviewRuler.errorForeground': '#ff7675',
      'editorOverviewRuler.warningForeground': '#fdcb6e',
      'editorOverviewRuler.infoForeground': '#6c5ce7',
      'editorWidget.shadow': '0 2px 8px rgba(0,0,0,0.5)',
    }
  });
  
  monaco.editor.defineTheme('wizard-theme', {
    base: 'vs-dark',
    inherit: false,
    rules: [
      { token: '', foreground: 'E8DBC3', background: '0F172A' },
      { token: 'keyword', foreground: 'FBBF24' },
      { token: 'string', foreground: 'E8DBC3' },
      { token: 'number', foreground: '06B6D4' },
      { token: 'comment', foreground: 'E8DBC3' },
      { token: 'type.identifier.java', foreground: '0EA5E9' },
      { token: 'variable', foreground: '0EA5E9' },
      { token: 'operator', foreground: 'E8DBC3' },
      { token: 'delimiter', foreground: 'E8DBC3' },
      { token: 'constant', foreground: '06B6D4' },
      { token: 'function', foreground: 'FBBF24' },
      { token: 'class', foreground: '0EA5E9' },
      { token: 'type', foreground: '0EA5E9' },
      { token: 'namespace', foreground: '0EA5E9' },
      { token: 'parameter', foreground: '0EA5E9' },
      { token: 'property', foreground: '0EA5E9' },
      { token: 'enum', foreground: '0EA5E9' },
      { token: 'enumMember', foreground: '06B6D4' },
      { token: 'interface', foreground: '0EA5E9' },
      { token: 'typeParameter', foreground: '0EA5E9' },
      { token: 'decorator', foreground: 'FBBF24' },
      { token: 'annotation', foreground: 'FBBF24' },
      { token: 'modifier', foreground: 'FBBF24' },
      { token: 'control', foreground: 'FBBF24' },
      { token: 'entity', foreground: '0EA5E9' },
      { token: 'invalid', foreground: 'EF4444', background: '0F172A' },
      { token: 'regexp', foreground: 'E8DBC3' },
      { token: 'meta', foreground: '0EA5E9' },
      { token: 'punctuation', foreground: 'E8DBC3' },
      { token: 'bracket', foreground: 'E8DBC3' },
      { token: 'brace', foreground: 'E8DBC3' },
      { token: 'parenthesis', foreground: 'E8DBC3' },
      { token: 'squareBracket', foreground: 'E8DBC3' },
      { token: 'angleBracket', foreground: 'E8DBC3' },
      { token: 'curlyBracket', foreground: 'E8DBC3' },
      { token: 'identifier', foreground: '0EA5E9' },
      { token: 'member', foreground: '0EA5E9' },
      { token: 'method', foreground: '0EA5E9' },
      { token: 'field', foreground: '0EA5E9' },
      { token: 'constructor', foreground: '0EA5E9' },
      { token: 'destructuring', foreground: '0EA5E9' },
      { token: 'label', foreground: 'FBBF24' },
      { token: 'unit', foreground: '06B6D4' },
      { token: 'boolean', foreground: 'FBBF24' },
      { token: 'null', foreground: 'FBBF24' },
      { token: 'undefined', foreground: 'FBBF24' },
      { token: 'this', foreground: 'FBBF24' },
      { token: 'super', foreground: 'FBBF24' },
      { token: 'new', foreground: 'FBBF24' },
      { token: 'return', foreground: 'FBBF24' },
      { token: 'throw', foreground: 'FBBF24' },
      { token: 'try', foreground: 'FBBF24' },
      { token: 'catch', foreground: 'FBBF24' },
      { token: 'finally', foreground: 'FBBF24' },
      { token: 'if', foreground: 'FBBF24' },
      { token: 'else', foreground: 'FBBF24' },
      { token: 'switch', foreground: 'FBBF24' },
      { token: 'case', foreground: 'FBBF24' },
      { token: 'default', foreground: 'FBBF24' },
      { token: 'for', foreground: 'FBBF24' },
      { token: 'while', foreground: 'FBBF24' },
      { token: 'do', foreground: 'FBBF24' },
      { token: 'break', foreground: 'FBBF24' },
      { token: 'continue', foreground: 'FBBF24' },
      { token: 'import', foreground: 'FBBF24' },
      { token: 'export', foreground: 'FBBF24' },
      { token: 'package', foreground: 'FBBF24' },
      { token: 'extends', foreground: 'FBBF24' },
      { token: 'implements', foreground: 'FBBF24' },
      { token: 'interface', foreground: 'FBBF24' },
      { token: 'abstract', foreground: 'FBBF24' },
      { token: 'final', foreground: 'FBBF24' },
      { token: 'static', foreground: 'FBBF24' },
      { token: 'public', foreground: 'FBBF24' },
      { token: 'private', foreground: 'FBBF24' },
      { token: 'protected', foreground: 'FBBF24' },
      { token: 'synchronized', foreground: 'FBBF24' },
      { token: 'volatile', foreground: 'FBBF24' },
      { token: 'transient', foreground: 'FBBF24' },
      { token: 'native', foreground: 'FBBF24' },
      { token: 'strictfp', foreground: 'FBBF24' },
      { token: 'instanceof', foreground: 'FBBF24' },
      { token: 'assert', foreground: 'FBBF24' },
      { token: 'enum', foreground: 'FBBF24' },
      { token: 'const', foreground: 'FBBF24' },
      { token: 'goto', foreground: 'FBBF24' },
      { token: 'var', foreground: 'FBBF24' },
      { token: 'let', foreground: 'FBBF24' },
      { token: 'function', foreground: 'FBBF24' },
      { token: 'class', foreground: 'FBBF24' },
      { token: 'interface', foreground: 'FBBF24' },
      { token: 'type', foreground: 'FBBF24' },
      { token: 'namespace', foreground: 'FBBF24' },
      { token: 'module', foreground: 'FBBF24' },
      { token: 'async', foreground: 'FBBF24' },
      { token: 'await', foreground: 'FBBF24' },
      { token: 'yield', foreground: 'FBBF24' },
      { token: 'generator', foreground: 'FBBF24' },
      { token: 'decorator', foreground: 'FBBF24' },
      { token: 'annotation', foreground: 'FBBF24' },
      { token: 'modifier', foreground: 'FBBF24' },
      { token: 'control', foreground: 'FBBF24' },
      { token: 'entity', foreground: '0EA5E9' },
      { token: 'invalid', foreground: 'EF4444', background: '0F172A' },
    ],
    colors: {
      'editor.background': '#0F172A',
      'editor.foreground': '#E8DBC3',
      'editor.lineHighlightBackground': '#1A2B3C',
      'editorCursor.foreground': '#FBBF24',
      'editorLineNumber.foreground': '#6B7280',
      'editor.selectionBackground': '#0EA5E9',
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
  
  monaco.editor.defineTheme('detective-theme', {
    base: 'vs-dark',
    inherit: false,
    rules: [
      { token: '', foreground: 'dcdcdc', background: '121212' },
      { token: 'keyword', foreground: 'd1b773', fontStyle: 'bold' },
      { token: 'string', foreground: 'cdaa7d' },
      { token: 'number', foreground: 'cdaa7d' },
      { token: 'comment', foreground: 'b4a287', fontStyle: 'italic' },
      { token: 'type.identifier.java', foreground: '7a9e7e' },
      { token: 'variable', foreground: '7a9e7e' },
      { token: 'invalid', foreground: '8C3B3B', background: '2C2C2C' },
      { token: 'delimiter', foreground: '444444' },
      { token: 'operator', foreground: 'd1b773' },
      { token: 'constant', foreground: 'cdaa7d' },
      { token: 'function', foreground: 'd1b773' },
      { token: 'regexp', foreground: 'b4a287' },
      { token: 'meta', foreground: '3c4c5a' },
    ],
    colors: {
      'editor.background': '#121212',
      'editor.foreground': '#dcdcdc',
      'editor.lineHighlightBackground': '#2a2a3a',
      'editor.selectionBackground': '#3c4c5a55',
      'editor.inactiveSelectionBackground': '#44444433',
      'editorCursor.foreground': '#d1b773',
      'editorLineNumber.foreground': '#b4a287',
      'editorLineNumber.activeForeground': '#d1b773',
      'editorWhitespace.foreground': '#444444',
      'editorIndentGuide.background': '#444444',
      'editorIndentGuide.activeBackground': '#7a9e7e',
      'editor.selectionHighlightBackground': '#3c4c5a33',
      'editor.wordHighlightBackground': '#7a9e7e33',
      'editor.wordHighlightStrongBackground': '#d1b77333',
      'editorBracketMatch.background': '#3c4c5a55',
      'editorBracketMatch.border': '#444444',
      'editorError.foreground': '#8C3B3B',
      'editorWarning.foreground': '#d1b773',
      'editorInfo.foreground': '#7a9e7e',
      'editorGutter.background': '#121212',
      'editorGutter.modifiedBackground': '#d1b773',
      'editorGutter.addedBackground': '#7a9e7e',
      'editorGutter.deletedBackground': '#8C3B3B',
      'editorWidget.background': '#2a2a3a',
      'editorWidget.border': 'rgba(255,255,255,0.05)',
      'editorSuggestWidget.background': '#2a2a3a',
      'editorSuggestWidget.border': 'rgba(255,255,255,0.05)',
      'editorSuggestWidget.foreground': '#dcdcdc',
      'editorSuggestWidget.selectedBackground': '#3c4c5a',
      'editorHoverWidget.background': '#2a2a3a',
      'editorHoverWidget.border': 'rgba(255,255,255,0.05)',
      'editorMarkerNavigation.background': '#121212',
      'editorMarkerNavigationError.background': '#8C3B3B',
      'editorMarkerNavigationWarning.background': '#d1b773',
      'editorMarkerNavigationInfo.background': '#7a9e7e',
      'editorOverviewRuler.border': 'rgba(255,255,255,0.05)',
      'editorOverviewRuler.errorForeground': '#8C3B3B',
      'editorOverviewRuler.warningForeground': '#d1b773',
      'editorOverviewRuler.infoForeground': '#7a9e7e',
      'editorWidget.shadow': '0 2px 8px rgba(0,0,0,0.5)',
    }
  });
  
  // Mark this monaco instance as having themes defined
  monacoThemesDefined.set(monaco, true);
};

const LessonMonacoEditor = ({
  value,
  onChange,
  language = "java",
  height = "400px",
  options = {},
  onMount: customOnMount,
  fixTagClass = null,
  fixTagRegex = null,
  fixTagHoverMessage = null,
  userChoices = {},
  placedChoicePositions = {},
  ...rest
}) => {
  const editorRef = useRef(null);
  const { topicId } = useParams();

  const currentTheme = useMemo(() => {
    if (topicId) {
      const numericTopicId = topicId.split('-')[0];
      const topic = subtopicContent[numericTopicId];
      return topic ? topic.theme : 'space';
    }
    return 'space';
  }, [topicId, subtopicContent]);

  const parsedTopicId = useMemo(() => {
    return topicId ? topicId.split('-')[0] : null;
  }, [topicId]);

  const handleMount = (editor, monaco) => {
    editorRef.current = editor;
    defineMonacoThemes(monaco);
    
    const themeName = getMonacoThemeName(currentTheme);
    monaco.editor.setTheme(themeName);
    
    if (fixTagRegex && fixTagClass) {
      const model = editor.getModel();
      if (model) {
        const updateDecorations = () => {
          const code = model.getValue();
          const matches = code.match(fixTagRegex);
          const decorations = [];
          
          if (matches) {
            matches.forEach(match => {
              const positions = [];
              let index = 0;
              while ((index = code.indexOf(match, index)) !== -1) {
                const startPos = model.getPositionAt(index);
                const endPos = model.getPositionAt(index + match.length);
                
                positions.push({
                  range: new monaco.Range(startPos.lineNumber, startPos.column, endPos.lineNumber, endPos.column),
                  options: {
                    className: fixTagClass,
                    hoverMessage: fixTagHoverMessage ? { value: fixTagHoverMessage } : undefined
                  }
                });
                index += match.length;
              }
              decorations.push(...positions);
            });
          }
          
          editor.deltaDecorations([], decorations);
        };
        
        updateDecorations();
        
        const changeDisposable = model.onDidChangeContent(() => {
          updateDecorations();
        });
        
        return () => {
          if (changeDisposable) {
            changeDisposable.dispose();
          }
        };
      }
    }
    
    setTimeout(() => {
      editor.updateOptions({});
    }, 100);
    
    if (customOnMount) {
      customOnMount(editor, monaco);
    }
  };

  const containerStyle = {
    width: '100%',
    height: '100%',
    ...(currentTheme === 'detective' ? {
      borderRadius: 6,
      boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
      overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.05)',
      background: '#232323',
    } : currentTheme === 'space' ? {
      borderRadius: 8,
      overflow: 'hidden',
      background: '#0a0a1a',
    } : {
      borderRadius: 8,
      overflow: 'hidden',
    }),
  };

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
          padding: { top: 15, bottom: 15, left: 15, right: 15 },
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
          fixedOverflowWidgets: true,
          overviewRulerBorder: false,
          hideCursorInOverviewRuler: true,
          ...options,
        }}
        onMount={handleMount}
        {...rest}
      />
    </div>
  );
};

export default LessonMonacoEditor; 