export function setupKeyboardShortcuts(handlers) {
  const handleKeyDown = (e) => {
    // Ctrl/Cmd + E: Export to CSV
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
      e.preventDefault();
      handlers.export?.();
    }
    
    // Ctrl/Cmd + A: Toggle add form (if not in input)
    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
      if (e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        handlers.toggleAddForm?.();
      }
    }
    
    // Ctrl/Cmd + F: Toggle filter
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
      e.preventDefault();
      handlers.toggleFilter?.();
    }
    
    // Ctrl/Cmd + R: Refresh
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
      e.preventDefault();
      handlers.refresh?.();
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('keydown', handleKeyDown);
  };
}
