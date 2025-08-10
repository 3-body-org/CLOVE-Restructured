import React, { useRef } from "react";
import Editor from "@monaco-editor/react";
import { useChallengeTheme } from '../hooks/useChallengeTheme';

const getMonacoThemeName = (appTheme) => {
  switch (appTheme) {
    case 'wizard': return 'wizard-theme';
    case 'detective': return 'detective-theme';
    default: return 'space-theme';
  }
};

const defineMonacoThemes = (monaco) => {
  if (monaco.__cloveThemesDefined) {
    monaco.__cloveThemesDefined = false;
  }
  
  if (monaco.__cloveThemesDefined) return;
  
  monaco.editor.defineTheme('space-theme', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: '', foreground: 'E2E8F0', background: '0a0a1a' },
      { token: 'keyword', foreground: '6c5ce7' },
      { token: 'string', foreground: 'ff7675' },
      { token: 'number', foreground: 'A6AAFB' },
      { token: 'comment', foreground: 'a8a5e6' },
      { token: 'type.identifier.java', foreground: 'A6AAFB' },
    ],
    colors: {
      'editor.background': '#0a0a1a',
      'editor.foreground': '#E2E8F0',
      'editor.lineHighlightBackground': '#232529',
      'editorCursor.foreground': '#A6AAFB',
      'editorLineNumber.foreground': '#a8a5e6',
      'editor.selectionBackground': '#3E3E5E',
      'editor.inactiveSelectionBackground': '#3E3E5E70',
    }
  });
  
  monaco.editor.defineTheme('wizard-theme', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: '', foreground: 'E8DBC3', background: '0F172A' },
      { token: 'keyword', foreground: 'FBBF24', fontStyle: 'bold' },
      { token: 'string', foreground: 'E8DBC3' },
      { token: 'number', foreground: '06B6D4' },
      { token: 'comment', foreground: 'E8DBC3' },
      { token: 'type.identifier.java', foreground: '0EA5E9' },
      { token: 'variable', foreground: '0EA5E9' },
      { token: 'invalid', foreground: 'ff6464', background: '1A2B3C' },
      { token: 'delimiter', foreground: '6B7280' },
      { token: 'operator', foreground: 'FBBF24' },
      { token: 'constant', foreground: '06B6D4' },
      { token: 'function', foreground: '0EA5E9' },
      { token: 'regexp', foreground: '6B7280' },
      { token: 'meta', foreground: '4A5568' },
    ],
    colors: {
      'editor.background': '#0F172A',
      'editor.foreground': '#E8DBC3',
      'editor.lineHighlightBackground': '#1A2B3C',
      'editor.selectionBackground': '#0EA5E9',
      'editor.inactiveSelectionBackground': '#0EA5E970',
      'editorCursor.foreground': '#FBBF24',
      'editorLineNumber.foreground': '#6B7280',
      'editorLineNumber.activeForeground': '#FBBF24',
      'editorWhitespace.foreground': '#6B7280',
      'editorIndentGuide.background': '#6B7280',
      'editorIndentGuide.activeBackground': '#0EA5E9',
      'editor.selectionHighlightBackground': '#0EA5E933',
      'editor.wordHighlightBackground': '#0EA5E933',
      'editor.wordHighlightStrongBackground': '#FBBF2433',
      'editorBracketMatch.background': '#0EA5E955',
      'editorBracketMatch.border': '#6B7280',
      'editorError.foreground': '#ff6464',
      'editorWarning.foreground': '#FBBF24',
      'editorInfo.foreground': '#0EA5E9',
      'editorGutter.background': '#0F172A',
      'editorGutter.modifiedBackground': '#FBBF24',
      'editorGutter.addedBackground': '#0EA5E9',
      'editorGutter.deletedBackground': '#ff6464',
      'editorWidget.background': '#1A2B3C',
      'editorWidget.border': 'rgba(14, 165, 233, 0.2)',
      'editorSuggestWidget.background': '#1A2B3C',
      'editorSuggestWidget.border': 'rgba(14, 165, 233, 0.2)',
      'editorSuggestWidget.foreground': '#E8DBC3',
      'editorSuggestWidget.selectedBackground': '#0EA5E9',
      'editorHoverWidget.background': '#1A2B3C',
      'editorHoverWidget.border': 'rgba(14, 165, 233, 0.2)',
      'editorMarkerNavigation.background': '#0F172A',
      'editorMarkerNavigationError.background': '#ff6464',
      'editorMarkerNavigationWarning.background': '#FBBF24',
      'editorMarkerNavigationInfo.background': '#0EA5E9',
      'editorOverviewRuler.border': 'rgba(14, 165, 233, 0.2)',
      'editorOverviewRuler.errorForeground': '#ff6464',
      'editorOverviewRuler.warningForeground': '#FBBF24',
      'editorOverviewRuler.infoForeground': '#0EA5E9',
      'editorWidget.shadow': '0 2px 8px rgba(14, 165, 233, 0.3)',
    }
  });
  
  monaco.editor.defineTheme('detective-theme', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: '', foreground: 'E0DFDB', background: '232323' },
      { token: 'keyword', foreground: 'D1B773', fontStyle: 'bold' },
      { token: 'string', foreground: 'CDAA7D' },
      { token: 'number', foreground: 'CDAA7D' },
      { token: 'comment', foreground: 'B4A287', fontStyle: 'italic' },
      { token: 'type.identifier.java', foreground: '7A9E7E' },
      { token: 'variable', foreground: 'CFC8B8' },
      { token: 'invalid', foreground: '8C3B3B', background: '2C2C2C' },
      { token: 'delimiter', foreground: '444444' },
      { token: 'operator', foreground: 'D1B773' },
      { token: 'constant', foreground: 'CDAA7D' },
      { token: 'function', foreground: 'D1B773' },
      { token: 'regexp', foreground: 'B4A287' },
      { token: 'meta', foreground: '3C4C5A' },
    ],
    colors: {
      'editor.background': '#232323',
      'editor.foreground': '#E0DFDB',
      'editor.lineHighlightBackground': '#2C2C2C',
      'editor.selectionBackground': '#3C4C5A55',
      'editor.inactiveSelectionBackground': '#44444433',
      'editorCursor.foreground': '#D1B773',
      'editorLineNumber.foreground': '#B4A287',
      'editorLineNumber.activeForeground': '#D1B773',
      'editorWhitespace.foreground': '#444444',
      'editorIndentGuide.background': '#444444',
      'editorIndentGuide.activeBackground': '#7A9E7E',
      'editor.selectionHighlightBackground': '#3C4C5A33',
      'editor.wordHighlightBackground': '#7A9E7E33',
      'editor.wordHighlightStrongBackground': '#D1B77333',
      'editorBracketMatch.background': '#3C4C5A55',
      'editorBracketMatch.border': '#444444',
      'editorError.foreground': '#8C3B3B',
      'editorWarning.foreground': '#D1B773',
      'editorInfo.foreground': '#7A9E7E',
      'editorGutter.background': '#232323',
      'editorGutter.modifiedBackground': '#D1B773',
      'editorGutter.addedBackground': '#7A9E7E',
      'editorGutter.deletedBackground': '#8C3B3B',
      'editorWidget.background': '#2C2C2C',
      'editorWidget.border': 'rgba(255,255,255,0.05)',
      'editorSuggestWidget.background': '#2C2C2C',
      'editorSuggestWidget.border': 'rgba(255,255,255,0.05)',
      'editorSuggestWidget.foreground': '#E0DFDB',
      'editorSuggestWidget.selectedBackground': '#3C4C5A',
      'editorHoverWidget.background': '#2C2C2C',
      'editorHoverWidget.border': 'rgba(255,255,255,0.05)',
      'editorMarkerNavigation.background': '#232323',
      'editorMarkerNavigationError.background': '#8C3B3B',
      'editorMarkerNavigationWarning.background': '#D1B773',
      'editorMarkerNavigationInfo.background': '#7A9E7E',
      'editorOverviewRuler.border': 'rgba(255,255,255,0.05)',
      'editorOverviewRuler.errorForeground': '#8C3B3B',
      'editorOverviewRuler.warningForeground': '#D1B773',
      'editorOverviewRuler.infoForeground': '#7A9E7E',
      'editorWidget.shadow': '0 2px 8px rgba(0,0,0,0.5)',
    }
  });
  monaco.__cloveThemesDefined = true;
};

const MonacoCodeBlock = ({
  value,
  onChange,
  language = "java",
  mode,
  fixTagClass = "bug-placeholder",
  fixTagRegex = /(?<!\w)\[\d+\](?!\w)/g,
  fixTagHoverMessage = "Drop a choice here",
  options = {},
  height = "400px",
  onMount: customOnMount,
  userChoices = {},
  placedChoicePositions = {},
  timerState = 'active',
  disabled = false,
  isResumed = false,
  ...rest
}) => {
  const editorRef = useRef(null);
  const decoratorRef = useRef(null);
  const clickableDecoratorRef = useRef(null);
  const { currentTheme } = useChallengeTheme();

  const shouldBeReadOnly = mode === 'output_tracing' || 
                          mode === 'code_completion' ||
                          (mode === 'code_fixer' && (timerState === 'expired' || disabled || isResumed));

  const shouldBeVisuallyDisabled = (mode === 'code_completion' && (timerState === 'expired' || disabled || isResumed)) ||
                                  (mode === 'code_fixer' && (timerState === 'expired' || disabled || isResumed)) ||
                                  (mode === 'output_tracing' && (timerState === 'expired' || disabled || isResumed));

  const updateDecorations = (editor, monaco) => {
    const model = editor.getModel();
    if (!model) {
      return;
    }
    const text = model.getValue();
    const matches = [];
    
    let match;
    while ((match = fixTagRegex.exec(text)) !== null) {
      const startPos = model.getPositionAt(match.index);
      const endPos = model.getPositionAt(match.index + match[0].length);
      
      matches.push({
        range: new monaco.Range(
          startPos.lineNumber,
          startPos.column,
          endPos.lineNumber,
          endPos.column
        ),
        options: {
          inlineClassName: fixTagClass,
          stickiness: 1
        }
      });
    }
    
    decoratorRef.current?.set(matches);
  };

  const updateClickableDecorations = (editor, monaco) => {
    const model = editor.getModel();
    if (!model) {
      return;
    }
    const clickableMatches = [];
    
    Object.entries(placedChoicePositions).forEach(([slotId, position]) => {
      const { line, column, length } = position;
      
      clickableMatches.push({
        range: new monaco.Range(
          line,
          column,
          line,
          column + length
        ),
        options: {
          inlineClassName: 'clickable-choice-unified',
          stickiness: 1
        }
      });
    });
    
    clickableDecoratorRef.current?.set(clickableMatches);
  };

  const handleMount = (editor, monaco) => {
    editorRef.current = editor;
    
    monaco.__cloveThemesDefined = false;
    defineMonacoThemes(monaco);
    
    setTimeout(() => {
      monaco.editor.setTheme(getMonacoThemeName(currentTheme));
    }, 10);
    
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .monaco-editor .clickable-choice-unified,
      .monaco-editor .clickable-choice-unified *,
      .monaco-editor .clickable-choice-unified span,
      .monaco-editor .clickable-choice-unified div {
        background: rgba(255, 215, 0, 0.25) !important;
        border: 1px solid rgba(255, 215, 0, 0.4) !important;
        border-radius: 3px !important;
        padding: 1px 3px !important;
        margin: 0 !important;
        cursor: ${shouldBeVisuallyDisabled ? 'not-allowed' : 'pointer'} !important;
        transition: background 0.2s ease !important;
        font-weight: normal !important;
        color: inherit !important;
        position: relative !important;
        display: inline-block !important;
        white-space: nowrap !important;
        box-sizing: border-box !important;
        text-decoration: none !important;
        outline: none !important;
        opacity: ${shouldBeVisuallyDisabled ? '0.6' : '1'} !important;
        pointer-events: ${shouldBeVisuallyDisabled ? 'none' : 'auto'} !important;
      }
      
      .monaco-editor .clickable-choice-unified:hover,
      .monaco-editor .clickable-choice-unified:hover *,
      .monaco-editor .clickable-choice-unified:hover span,
      .monaco-editor .clickable-choice-unified:hover div {
        background: ${shouldBeVisuallyDisabled ? 'rgba(255, 215, 0, 0.25)' : 'rgba(255, 215, 0, 0.35)'} !important;
        cursor: ${shouldBeVisuallyDisabled ? 'not-allowed' : 'grabbing'} !important;
      }
    `;
    document.head.appendChild(styleElement);
    
    if (fixTagClass && fixTagRegex) {
      decoratorRef.current = editor.createDecorationsCollection();
      updateDecorations(editor, monaco);
      
      clickableDecoratorRef.current = editor.createDecorationsCollection();
      updateClickableDecorations(editor, monaco);
      
      const disposable = editor.onDidChangeModelContent(() => {
        updateDecorations(editor, monaco);
        updateClickableDecorations(editor, monaco);
      });
      
      if (customOnMount) customOnMount(editor, monaco);
      
      return () => {
        disposable.dispose();
        decoratorRef.current?.clear();
        clickableDecoratorRef.current?.clear();
        document.head.removeChild(styleElement);
      };
    } else {
      if (customOnMount) customOnMount(editor, monaco);
      return () => {
        document.head.removeChild(styleElement);
      };
    }
  };

  React.useEffect(() => {
    if (editorRef.current && window.monaco) {
      window.monaco.__cloveThemesDefined = false;
      defineMonacoThemes(window.monaco);
      
      setTimeout(() => {
        window.monaco.editor.setTheme(getMonacoThemeName(currentTheme));
      }, 10);
    }
  }, [currentTheme]);

  React.useEffect(() => {
    if (editorRef.current && clickableDecoratorRef.current) {
      updateClickableDecorations(editorRef.current, window.monaco);
    }
  }, [placedChoicePositions]);

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
        onChange={shouldBeReadOnly ? undefined : onChange}
        theme={getMonacoThemeName(currentTheme)}
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
          fontFamily: currentTheme === 'detective' ? 'IBM Plex Mono, JetBrains Mono, Courier Prime, monospace' : 'Fira Code, monospace',
          fontWeight: '400',
          lineHeight: 24,
          glyphMargin: false,
          lineNumbersMinChars: 3,
          renderLineHighlight: 'all',
          readOnly: shouldBeReadOnly,
          domReadOnly: shouldBeReadOnly,
          mouseWheelZoom: !shouldBeReadOnly,
          contextmenu: !shouldBeReadOnly,
          quickSuggestions: false,
          suggestOnTriggerCharacters: false,
          acceptSuggestionOnCommitCharacter: false,
          acceptSuggestionOnEnter: 'off',
          tabCompletion: 'off',
          wordBasedSuggestions: 'off',
          parameterHints: { enabled: false },
          hover: { enabled: !shouldBeReadOnly, delay: 100 },
          selectOnLineNumbers: !shouldBeReadOnly,
          roundedSelection: !shouldBeReadOnly,
          cursorBlinking: shouldBeReadOnly ? 'hidden' : 'blink',
          cursorStyle: shouldBeReadOnly ? 'hidden' : 'line',
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

export default MonacoCodeBlock; 