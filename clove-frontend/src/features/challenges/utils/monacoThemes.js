import * as monaco from 'monaco-editor';

let themesDefined = false;

export const defineMonacoThemes = () => {
  if (themesDefined) return;
  // Space Theme
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
  // Wizard Theme
  monaco.editor.defineTheme('wizard-theme', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: '', foreground: 'e8dbc3', background: '1e102b' },
      { token: 'keyword', foreground: 'b78a5b' },
      { token: 'string', foreground: '3fbabf' },
      { token: 'number', foreground: 'b78a5b' },
      { token: 'comment', foreground: 'a99fcc' },
      { token: 'type.identifier.java', foreground: 'b78a5b' },
    ],
    colors: {
      'editor.background': '#1e102b',
      'editor.foreground': '#e8dbc3',
      'editor.lineHighlightBackground': '#2b1a3a',
      'editorCursor.foreground': '#b78a5b',
      'editorLineNumber.foreground': '#a99fcc',
      'editor.selectionBackground': '#3E3E5E',
      'editor.inactiveSelectionBackground': '#3E3E5E70',
    }
  });
  // Detective Theme
  monaco.editor.defineTheme('detective-theme', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: '', foreground: 'dcdcdc', background: '121212' },
      { token: 'keyword', foreground: '008ba3' },
      { token: 'string', foreground: 'd4c23d' },
      { token: 'number', foreground: 'b53939' },
      { token: 'comment', foreground: '888c94' },
      { token: 'type.identifier.java', foreground: '008ba3' },
    ],
    colors: {
      'editor.background': '#121212',
      'editor.foreground': '#dcdcdc',
      'editor.lineHighlightBackground': '#232529',
      'editorCursor.foreground': '#008ba3',
      'editorLineNumber.foreground': '#888c94',
      'editor.selectionBackground': '#3E3E5E',
      'editor.inactiveSelectionBackground': '#3E3E5E70',
    }
  });
  themesDefined = true;
};

export const getMonacoThemeName = (appTheme) => {
  switch (appTheme) {
    case 'wizard': return 'wizard-theme';
    case 'detective': return 'detective-theme';
    default: return 'space-theme';
  }
}; 