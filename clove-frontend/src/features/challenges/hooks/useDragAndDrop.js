import { useState, useCallback, useRef } from 'react';

export const useDragAndDrop = (monacoEditorRef, setCode, setUsedChoices) => {
  const [isDragging, setIsDragging] = useState(false);
  const [currentDragItem, setCurrentDragItem] = useState(null);
  const [hoveredPlaceholder, setHoveredPlaceholder] = useState(null);
  const decorationsRef = useRef([]);

  const handleDragStart = useCallback((e, choice, isFromEditor = false, selection = null) => {
    console.log('=== DRAG START ===');
    
    const dragData = isFromEditor ? {
      type: 'editor-selection',
      value: selection?.text || '',
      range: selection?.range,
      isFromEditor: true
    } : {
      ...choice,
      type: 'choice',
      isFromEditor: false
    };

    console.log('Drag data:', dragData);
    
    e.dataTransfer.effectAllowed = 'copyMove';
    e.dataTransfer.dropEffect = isFromEditor ? 'move' : 'copy';
    
    e.dataTransfer.clearData();
    e.dataTransfer.setData('text/plain', dragData.value);
    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
    
    const dragImage = document.createElement('div');
    dragImage.textContent = dragData.value;
    dragImage.style.position = 'absolute';
    dragImage.style.padding = '8px 12px';
    dragImage.style.background = isFromEditor ? '#e6f3ff' : '#f0f0f0';
    dragImage.style.border = `1px solid ${isFromEditor ? '#0078d7' : '#ccc'}`;
    dragImage.style.borderRadius = '4px';
    dragImage.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
    dragImage.style.zIndex = '1000';
    dragImage.style.fontFamily = 'monospace';
    dragImage.style.whiteSpace = 'nowrap';
    dragImage.style.overflow = 'hidden';
    dragImage.style.textOverflow = 'ellipsis';
    dragImage.style.maxWidth = '300px';
    
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 10, 10);
    setTimeout(() => document.body.removeChild(dragImage), 0);
    
    setCurrentDragItem(dragData);
    
    if (!isFromEditor) {
      e.currentTarget.classList.add('dragging');
    }
  }, []);

  const handleDragEnd = useCallback((e) => {
    setCurrentDragItem(null);
    
    const elements = document.querySelectorAll('.choice');
    elements.forEach((el) => el.classList.remove('dragging'));
  }, []);

  const handleDropIntoEditor = useCallback((editor, monaco, e) => {
    console.log('=== DROP INTO EDITOR ===');
    e.preventDefault();
    e.stopPropagation();
    
    let dragData;
    try {
      const jsonData = e.dataTransfer.getData('application/json');
      dragData = jsonData ? JSON.parse(jsonData) : null;
    } catch (error) {
      console.error('Error parsing drag data:', error);
      return;
    }
    
    const textToInsert = dragData?.value || currentDragItem?.value || '';
    
    if (!textToInsert) {
      console.error('No text to insert');
      return;
    }
    
    console.log('Inserting text:', { textToInsert, dragData });
    
    if (dragData?.isFromEditor && dragData.range) {
      editor.executeEdits('drag-move', [{
        range: new monaco.Range(
          dragData.range.startLineNumber,
          dragData.range.startColumn,
          dragData.range.endLineNumber,
          dragData.range.endColumn
        ),
        text: '',
        forceMoveMarkers: true
      }]);
    }

    try {
      const target = e.currentTarget;
      const rect = target.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const position = editor.getPositionAt({ left: x, top: y });
      if (!position) return;

      const editOperation = {
        range: {
          startLineNumber: position.lineNumber,
          startColumn: position.column,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        },
        text: textToInsert,
        forceMoveMarkers: true,
      };

      editor.executeEdits('drag-and-drop', [editOperation]);

      const newCode = editor.getModel().getValue();
      setCode(newCode);

      const newPosition = {
        lineNumber: position.lineNumber,
        column: position.column + textToInsert.length,
      };

      editor.setPosition(newPosition);
      editor.focus();

      setUsedChoices((prev) => [...prev, textToInsert]);
      setCurrentDragItem(null);
      setIsDragging(false);

      if (decorationsRef.current?.length) {
        decorationsRef.current = editor.deltaDecorations(decorationsRef.current, []);
      }
    } catch (error) {
      console.error('Error handling drop event:', error);
    }
  }, [currentDragItem, setUsedChoices, setIsDragging, setCode]);

  const handleChoicesBarDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('=== DROP ON CHOICES BAR ===');
    
    let dragData;
    try {
      const jsonData = e.dataTransfer.getData('application/json');
      dragData = jsonData ? JSON.parse(jsonData) : null;
      console.log('Drag data received:', dragData);
    } catch (error) {
      console.error('Error parsing drag data:', error);
      return;
    }
    
    if (dragData?.isFromEditor && dragData.value) {
      console.log('Processing drop from editor:', dragData.value);
      
      const newChoice = {
        value: dragData.value.trim(),
        fix: `CUSTOM_${Date.now()}`
      };
      
      console.log('Adding new choice:', newChoice);
      
      if (e.dataTransfer.dropEffect === 'move' && dragData.range) {
        console.log('Performing move operation, removing text from editor');
        const editor = monacoEditorRef.current;
        if (editor) {
          try {
            editor.executeEdits('drag-remove', [{
              range: new window.monaco.Range(
                dragData.range.startLineNumber,
                dragData.range.startColumn,
                dragData.range.endLineNumber,
                dragData.range.endColumn
              ),
              text: '',
              forceMoveMarkers: true
            }]);
            
            const newCode = editor.getValue();
            setCode(newCode);
            
            console.log('Successfully removed text from editor');
          } catch (error) {
            console.error('Error removing text from editor:', error);
          }
        }
      }
    } else {
      console.log('Drop event ignored - not from editor or missing value');
    }
  }, [monacoEditorRef, setCode]);

  return {
    isDragging,
    currentDragItem,
    hoveredPlaceholder,
    setHoveredPlaceholder,
    setIsDragging,
    handleDragStart,
    handleDragEnd,
    handleDropIntoEditor,
    handleChoicesBarDrop,
    decorationsRef
  };
}; 