import { useEffect, useRef, useCallback } from 'react';
import {
  KeyboardNavigationHandler,
  announceToScreenReader,
  SCREEN_READER_MESSAGES,
  detectHighContrastMode,
  prefersReducedMotion
} from '../utils/accessibility';

/**
 * Hook for managing accessibility features
 */
export const useAccessibility = (
  _tableId: string,
  options: {
    enableKeyboardNavigation?: boolean;
    enableScreenReaderAnnouncements?: boolean;
    onCellFocus?: (row: number, col: number) => void;
    onCellActivate?: (row: number, col: number) => void;
    onRowSelect?: (row: number) => void;
  } = {}
) => {
  const tableRef = useRef<HTMLElement>(null);
  const keyboardHandlerRef = useRef<KeyboardNavigationHandler | null>(null);
  const announcementTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    enableKeyboardNavigation = true,
    enableScreenReaderAnnouncements = true,
    onCellFocus,
    onCellActivate,
    onRowSelect
  } = options;

  // Initialize keyboard navigation
  useEffect(() => {
    if (enableKeyboardNavigation && tableRef.current) {
      keyboardHandlerRef.current = new KeyboardNavigationHandler(
        tableRef.current,
        {
          onCellFocus,
          onCellActivate,
          onRowSelect
        }
      );

      return () => {
        keyboardHandlerRef.current?.destroy();
      };
    }
  }, [enableKeyboardNavigation, onCellFocus, onCellActivate, onRowSelect]);

  // Announce messages to screen reader with debouncing
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!enableScreenReaderAnnouncements) return;

    // Clear previous timeout to debounce announcements
    if (announcementTimeoutRef.current) {
      clearTimeout(announcementTimeoutRef.current);
    }

    announcementTimeoutRef.current = setTimeout(() => {
      announceToScreenReader(message, priority);
    }, 100);
  }, [enableScreenReaderAnnouncements]);

  // Accessibility event handlers
  const accessibilityHandlers = {
    onTableLoad: useCallback((rowCount: number) => {
      announce(SCREEN_READER_MESSAGES.TABLE_LOADED(rowCount));
    }, [announce]),

    onRowSelect: useCallback((rowIndex: number, isSelected: boolean) => {
      const message = isSelected 
        ? SCREEN_READER_MESSAGES.ROW_SELECTED(rowIndex)
        : SCREEN_READER_MESSAGES.ROW_DESELECTED(rowIndex);
      announce(message);
    }, [announce]),

    onColumnSort: useCallback((column: string, direction: string) => {
      announce(SCREEN_READER_MESSAGES.COLUMN_SORTED(column, direction));
    }, [announce]),

    onFilterApply: useCallback((column: string, value: string) => {
      announce(SCREEN_READER_MESSAGES.FILTER_APPLIED(column, value));
    }, [announce]),

    onFilterClear: useCallback((column: string) => {
      announce(SCREEN_READER_MESSAGES.FILTER_CLEARED(column));
    }, [announce]),

    onCellEditStart: useCallback((column: string, row: number) => {
      announce(SCREEN_READER_MESSAGES.CELL_EDITING(column, row));
    }, [announce]),

    onCellEditSave: useCallback((column: string, row: number) => {
      announce(SCREEN_READER_MESSAGES.CELL_EDIT_SAVED(column, row));
    }, [announce]),

    onCellEditCancel: useCallback((column: string, row: number) => {
      announce(SCREEN_READER_MESSAGES.CELL_EDIT_CANCELLED(column, row));
    }, [announce]),

    onRowExpand: useCallback((row: number, isExpanded: boolean) => {
      const message = isExpanded 
        ? SCREEN_READER_MESSAGES.ROW_EXPANDED(row)
        : SCREEN_READER_MESSAGES.ROW_COLLAPSED(row);
      announce(message);
    }, [announce]),

    onBulkAction: useCallback((action: string, count: number) => {
      announce(SCREEN_READER_MESSAGES.BULK_ACTION(action, count));
    }, [announce]),

    onContextMenuOpen: useCallback(() => {
      announce(SCREEN_READER_MESSAGES.CONTEXT_MENU_OPENED);
    }, [announce]),

    onContextMenuClose: useCallback(() => {
      announce(SCREEN_READER_MESSAGES.CONTEXT_MENU_CLOSED);
    }, [announce]),

    onLoadingStart: useCallback(() => {
      announce(SCREEN_READER_MESSAGES.LOADING, 'assertive');
    }, [announce]),

    onLoadingEnd: useCallback(() => {
      announce(SCREEN_READER_MESSAGES.LOADED);
    }, [announce]),

    onError: useCallback((message: string) => {
      announce(SCREEN_READER_MESSAGES.ERROR(message), 'assertive');
    }, [announce])
  };

  // Detect accessibility preferences
  const accessibilityPreferences = {
    highContrastMode: detectHighContrastMode(),
    reducedMotion: prefersReducedMotion()
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (announcementTimeoutRef.current) {
        clearTimeout(announcementTimeoutRef.current);
      }
    };
  }, []);

  return {
    tableRef,
    accessibilityHandlers,
    accessibilityPreferences,
    announce
  };
};

/**
 * Hook for managing focus within a container (e.g., context menu, modal)
 */
export const useFocusTrap = (isActive: boolean) => {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    
    // Focus first focusable element when activated
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length > 0) {
      (focusableElements[0] as HTMLElement).focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        const firstFocusable = focusableElements[0] as HTMLElement;
        const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (event.shiftKey) {
          if (document.activeElement === firstFocusable) {
            event.preventDefault();
            lastFocusable.focus();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            event.preventDefault();
            firstFocusable.focus();
          }
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive]);

  return containerRef;
};

/**
 * Hook for managing ARIA live regions
 */
export const useAriaLiveRegion = () => {
  const liveRegionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Create live region if it doesn't exist
    if (!liveRegionRef.current) {
      const liveRegion = document.createElement('div');
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.style.position = 'absolute';
      liveRegion.style.left = '-10000px';
      liveRegion.style.width = '1px';
      liveRegion.style.height = '1px';
      liveRegion.style.overflow = 'hidden';
      
      document.body.appendChild(liveRegion);
      (liveRegionRef as any).current = liveRegion;
    }

    return () => {
      if (liveRegionRef.current && document.body.contains(liveRegionRef.current)) {
        document.body.removeChild(liveRegionRef.current);
      }
    };
  }, []);

  const announce = useCallback((message: string) => {
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = message;
    }
  }, []);

  return { announce };
};