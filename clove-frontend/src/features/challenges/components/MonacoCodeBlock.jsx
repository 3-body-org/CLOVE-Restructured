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
  // Clear existing theme cache to force refresh
  if (monaco.__cloveThemesDefined) {
    monaco.__cloveThemesDefined = false;
  }
  
  if (monaco.__cloveThemesDefined) return;
  
  // Space Theme (unchanged)
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
  // Wizard Theme (updated to match new color palette)
  monaco.editor.defineTheme('wizard-theme', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: '', foreground: 'E8DBC3', background: '0F172A' }, // Aged Parchment text, Deep Twilight Blue bg
      { token: 'keyword', foreground: 'FBBF24', fontStyle: 'bold' }, // Enchanted Gold Bright
      { token: 'string', foreground: 'E8DBC3' }, // Aged Parchment
      { token: 'number', foreground: '06B6D4' }, // Arcane Turquoise Deep
      { token: 'comment', foreground: 'E8DBC3' }, // Aged Parchment
      { token: 'type.identifier.java', foreground: '0EA5E9' }, // Arcane Turquoise Bright
      { token: 'variable', foreground: '0EA5E9' }, // Arcane Turquoise Bright
      { token: 'invalid', foreground: 'ff6464', background: '1A2B3C' }, // Error red
      { token: 'delimiter', foreground: '6B7280' }, // Ancient Stone Light
      { token: 'operator', foreground: 'FBBF24' }, // Enchanted Gold Bright
      { token: 'constant', foreground: '06B6D4' }, // Arcane Turquoise Deep
      { token: 'function', foreground: '0EA5E9' }, // Arcane Turquoise Bright
      { token: 'regexp', foreground: '6B7280' }, // Ancient Stone Light
      { token: 'meta', foreground: '4A5568' }, // Ancient Stone Grey
    ],
    colors: {
      'editor.background': '#0F172A', // Deep Twilight Blue
      'editor.foreground': '#E8DBC3', // Aged Parchment
      'editor.lineHighlightBackground': '#1A2B3C', // Deep Navy
      'editor.selectionBackground': '#0EA5E9', // Arcane Turquoise Bright
      'editor.inactiveSelectionBackground': '#0EA5E970', // Arcane Turquoise Bright with opacity
      'editorCursor.foreground': '#FBBF24', // Enchanted Gold Bright
      'editorLineNumber.foreground': '#6B7280', // Ancient Stone Light
      'editorLineNumber.activeForeground': '#FBBF24', // Enchanted Gold Bright
      'editorWhitespace.foreground': '#6B7280', // Ancient Stone Light
      'editorIndentGuide.background': '#6B7280', // Ancient Stone Light
      'editorIndentGuide.activeBackground': '#0EA5E9', // Arcane Turquoise Bright
      'editor.selectionHighlightBackground': '#0EA5E933', // Arcane Turquoise Bright with opacity
      'editor.wordHighlightBackground': '#0EA5E933', // Arcane Turquoise Bright with opacity
      'editor.wordHighlightStrongBackground': '#FBBF2433', // Enchanted Gold Bright with opacity
      'editorBracketMatch.background': '#0EA5E955', // Arcane Turquoise Bright with opacity
      'editorBracketMatch.border': '#6B7280', // Ancient Stone Light
      'editorError.foreground': '#ff6464', // Error red
      'editorWarning.foreground': '#FBBF24', // Enchanted Gold Bright
      'editorInfo.foreground': '#0EA5E9', // Arcane Turquoise Bright
      'editorGutter.background': '#0F172A', // Deep Twilight Blue
      'editorGutter.modifiedBackground': '#FBBF24', // Enchanted Gold Bright
      'editorGutter.addedBackground': '#0EA5E9', // Arcane Turquoise Bright
      'editorGutter.deletedBackground': '#ff6464', // Error red
      'editorWidget.background': '#1A2B3C', // Deep Navy
      'editorWidget.border': 'rgba(14, 165, 233, 0.2)', // Arcane Turquoise Bright with opacity
      'editorSuggestWidget.background': '#1A2B3C', // Deep Navy
      'editorSuggestWidget.border': 'rgba(14, 165, 233, 0.2)', // Arcane Turquoise Bright with opacity
      'editorSuggestWidget.foreground': '#E8DBC3', // Aged Parchment
      'editorSuggestWidget.selectedBackground': '#0EA5E9', // Arcane Turquoise Bright
      'editorHoverWidget.background': '#1A2B3C', // Deep Navy
      'editorHoverWidget.border': 'rgba(14, 165, 233, 0.2)', // Arcane Turquoise Bright with opacity
      'editorMarkerNavigation.background': '#0F172A', // Deep Twilight Blue
      'editorMarkerNavigationError.background': '#ff6464', // Error red
      'editorMarkerNavigationWarning.background': '#FBBF24', // Enchanted Gold Bright
      'editorMarkerNavigationInfo.background': '#0EA5E9', // Arcane Turquoise Bright
      'editorOverviewRuler.border': 'rgba(14, 165, 233, 0.2)', // Arcane Turquoise Bright with opacity
      'editorOverviewRuler.errorForeground': '#ff6464', // Error red
      'editorOverviewRuler.warningForeground': '#FBBF24', // Enchanted Gold Bright
      'editorOverviewRuler.infoForeground': '#0EA5E9', // Arcane Turquoise Bright
      'editorWidget.shadow': '0 2px 8px rgba(14, 165, 233, 0.3)', // Arcane Turquoise Bright shadow
    }
  });
  // Detective/Noir Theme (revamped)
  monaco.editor.defineTheme('detective-theme', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: '', foreground: 'E0DFDB', background: '232323' }, // main text
      { token: 'keyword', foreground: 'D1B773', fontStyle: 'bold' }, // gold
      { token: 'string', foreground: 'CDAA7D' }, // brass
      { token: 'number', foreground: 'CDAA7D' }, // brass
      { token: 'comment', foreground: 'B4A287', fontStyle: 'italic' }, // sepia
      { token: 'type.identifier.java', foreground: '7A9E7E' }, // olive green
      { token: 'variable', foreground: 'CFC8B8' }, // light tan
      { token: 'invalid', foreground: '8C3B3B', background: '2C2C2C' }, // error/oxblood
      { token: 'delimiter', foreground: '444444' }, // muted
      { token: 'operator', foreground: 'D1B773' }, // gold
      { token: 'constant', foreground: 'CDAA7D' },
      { token: 'function', foreground: 'D1B773' },
      { token: 'regexp', foreground: 'B4A287' }, // sepia
      { token: 'meta', foreground: '3C4C5A' }, // navy
    ],
    colors: {
      'editor.background': '#232323', // main bg
      'editor.foreground': '#E0DFDB',
      'editor.lineHighlightBackground': '#2C2C2C', // panel bg
      'editor.selectionBackground': '#3C4C5A55', // navy highlight
      'editor.inactiveSelectionBackground': '#44444433', // muted
      'editorCursor.foreground': '#D1B773', // gold
      'editorLineNumber.foreground': '#B4A287', // sepia
      'editorLineNumber.activeForeground': '#D1B773', // gold
      'editorWhitespace.foreground': '#444444',
      'editorIndentGuide.background': '#444444',
      'editorIndentGuide.activeBackground': '#7A9E7E', // olive
      'editor.selectionHighlightBackground': '#3C4C5A33',
      'editor.wordHighlightBackground': '#7A9E7E33', // olive
      'editor.wordHighlightStrongBackground': '#D1B77333', // gold
      'editorBracketMatch.background': '#3C4C5A55',
      'editorBracketMatch.border': '#444444',
      'editorError.foreground': '#8C3B3B', // oxblood
      'editorWarning.foreground': '#D1B773', // gold
      'editorInfo.foreground': '#7A9E7E', // olive
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
  mode, // NEW: Add mode prop to determine read-only behavior
  fixTagClass = "bug-placeholder",
  fixTagRegex = /\[\d+\]/g,
  fixTagHoverMessage = "Drop a choice here",
  options = {},
  height = "400px",
  onMount: customOnMount,
  userChoices = {}, // Add userChoices prop for visual indicators
  placedChoicePositions = {}, // NEW: Add placedChoicePositions prop for accurate highlighting
  timerState = 'active', // Add timerState prop to handle timer expiration
  disabled = false, // Add disabled prop for additional control
  isResumed = false, // Add isResumed prop for cancelled challenges
  ...rest
}) => {
  const editorRef = useRef(null);
  const decoratorRef = useRef(null);
  const clickableDecoratorRef = useRef(null); // New decorator for clickable choices
  const { currentTheme } = useChallengeTheme();

  // Determine read-only behavior based on challenge mode and timer state
  const shouldBeReadOnly = mode === 'output_tracing' || 
                          mode === 'code_completion' || // Always read-only for code completion
                          (mode === 'code_fixer' && (timerState === 'expired' || disabled || isResumed));

  // Determine if the editor should be visually disabled (darkened, not-allowed cursor)
  const shouldBeVisuallyDisabled = (mode === 'code_completion' && (timerState === 'expired' || disabled || isResumed)) ||
                                  (mode === 'code_fixer' && (timerState === 'expired' || disabled || isResumed)) ||
                                  (mode === 'output_tracing' && (timerState === 'expired' || disabled || isResumed));



  // Decoration logic for placeholders [1], [2], etc. - follows guide's approach
  const updateDecorations = (editor, monaco) => {
    const model = editor.getModel();
    if (!model) {
      return;
    }
    const text = model.getValue();
    const matches = [];
    
    // Find placeholders [1], [2], etc.
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
    
    // Apply decorations to editor
    decoratorRef.current?.set(matches);
  };

  // NEW: Visual indicators for clickable choices with position-based highlighting
  const updateClickableDecorations = (editor, monaco) => {
    const model = editor.getModel();
    if (!model) {
      return;
    }
    const clickableMatches = [];
    
    // Use placedChoicePositions for accurate highlighting
    Object.entries(placedChoicePositions).forEach(([slotId, position]) => {
      const { line, column, length } = position;
      

      
      // Create decoration for the exact final position
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
    
    // Apply clickable decorations to editor
    clickableDecoratorRef.current?.set(clickableMatches);
  };

  const handleMount = (editor, monaco) => {
    editorRef.current = editor;
    
    // Force theme refresh by clearing cache and redefining themes
    monaco.__cloveThemesDefined = false;
    defineMonacoThemes(monaco);
    
    // Set the theme with a slight delay to ensure it's applied
    setTimeout(() => {
      monaco.editor.setTheme(getMonacoThemeName(currentTheme));
    }, 10);
    
    // Create CSS for simple highlight with cursor pointer on hover
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
    
    // Only create decorations if fixTag props are provided
    if (fixTagClass && fixTagRegex) {
      // Decorations for placeholders
      decoratorRef.current = editor.createDecorationsCollection();
      updateDecorations(editor, monaco);
      
      // NEW: Decorations for clickable choices
      clickableDecoratorRef.current = editor.createDecorationsCollection();
      updateClickableDecorations(editor, monaco);
      
      // Update on content change
      const disposable = editor.onDidChangeModelContent(() => {
        updateDecorations(editor, monaco);
        updateClickableDecorations(editor, monaco);
      });
      
      // Custom onMount
      if (customOnMount) customOnMount(editor, monaco);
      
      // Cleanup
      return () => {
        disposable.dispose();
        decoratorRef.current?.clear();
        clickableDecoratorRef.current?.clear();
        document.head.removeChild(styleElement);
      };
    } else {
      // No fixTag props, just call custom onMount
      if (customOnMount) customOnMount(editor, monaco);
      return () => {
        document.head.removeChild(styleElement);
      };
    }
  };

  // Update theme when currentTheme changes
  React.useEffect(() => {
    if (editorRef.current && window.monaco) {
      // Force theme refresh
      window.monaco.__cloveThemesDefined = false;
      defineMonacoThemes(window.monaco);
      
      // Set the new theme
      setTimeout(() => {
        window.monaco.editor.setTheme(getMonacoThemeName(currentTheme));
      }, 10);
    }
  }, [currentTheme]);

  // Update clickable decorations when placedChoicePositions changes
  React.useEffect(() => {
    if (editorRef.current && clickableDecoratorRef.current) {
      updateClickableDecorations(editorRef.current, window.monaco);
    }
  }, [placedChoicePositions]);

  // Add noir border radius and shadow for detective theme
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
          readOnly: shouldBeReadOnly, // Set readOnly based on challenge mode
          domReadOnly: shouldBeReadOnly, // Set domReadOnly to prevent DOM interactions when read-only
          // Disable mouse interactions when timer expires or challenge is resumed
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
          // Disable selection and cursor when read-only
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