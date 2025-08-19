import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DrawerProps {
  /**
   * Controls the visibility of the drawer
   */
  isOpen: boolean;
  /**
   * Callback function when drawer is closed
   */
  onClose: () => void;
  /**
   * Content to be displayed inside the drawer
   */
  children: React.ReactNode;
  /**
   * Position of the drawer
   */
  side?: 'left' | 'right' | 'top' | 'bottom';
  /**
   * Width of the drawer (for left/right) or height (for top/bottom)
   */
  size?: string;
  /**
   * Show overlay behind drawer
   */
  overlay?: boolean;
  /**
   * Whether drawer should be elevated
   */
  elevated?: boolean;
  /**
   * Whether drawer should be fixed positioned
   */
  fixed?: boolean;
  /**
   * Whether drawer should be bordered
   */
  bordered?: boolean;
  /**
   * Whether to show mini version (only for left/right)
   */
  mini?: boolean;
  /**
   * Width of mini drawer
   */
  miniWidth?: string;
  /**
   * Whether drawer can be closed by clicking outside
   */
  persistent?: boolean;
  /**
   * Custom class names
   */
  className?: string;
  /**
   * Behavior when drawer is shown
   */
  behavior?: 'default' | 'desktop' | 'mobile';
  /**
   * Breakpoint for responsive behavior
   */
  breakpoint?: number;
  /**
   * Whether to show a resize handle
   */
  resizable?: boolean;
  /**
   * Minimum size when resizing
   */
  minSize?: string;
  /**
   * Maximum size when resizing
   */
  maxSize?: string;
}

const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  children,
  side = 'left',
  size = '300px',
  overlay = true,
  elevated = false,
  fixed = false,
  bordered = false,
  mini = false,
  miniWidth = '60px',
  persistent = false,
  className = '',
  behavior = 'default',
  breakpoint = 1024,
  resizable = false,
  minSize = '200px',
  maxSize = '600px',
}) => {
  const [isMini, setIsMini] = useState(mini);
  const [isResizing, setIsResizing] = useState(false);
  const [currentSize, setCurrentSize] = useState(size);
  const [isMobile, setIsMobile] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const resizeStartPos = useRef(0);
  const resizeStartSize = useRef(0);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    if (behavior !== 'default') {
      window.addEventListener('resize', handleResize);
      handleResize();
    }

    return () => {
      if (behavior !== 'default') {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, [behavior, breakpoint]);

  // Handle resize functionality
  useEffect(() => {
    if (!resizable) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      let newSize;
      if (side === 'left' || side === 'right') {
        const diff = e.clientX - resizeStartPos.current;
        newSize = side === 'left' ? 
          resizeStartSize.current + diff :
          resizeStartSize.current - diff;
      } else {
        const diff = e.clientY - resizeStartPos.current;
        newSize = side === 'top' ? 
          resizeStartSize.current + diff :
          resizeStartSize.current - diff;
      }

      // Apply min/max constraints
      newSize = Math.max(parseInt(minSize), Math.min(parseInt(maxSize), newSize));
      setCurrentSize(`${newSize}px`);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, side, minSize, maxSize]);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    resizeStartPos.current = side === 'left' || side === 'right' ? e.clientX : e.clientY;
    resizeStartSize.current = parseInt(currentSize);
  };

  const getTransform = () => {
    switch (side) {
      case 'left': return { x: '-100%' };
      case 'right': return { x: '100%' };
      case 'top': return { y: '-100%' };
      case 'bottom': return { y: '100%' };
    }
  };

  const getSizeStyle = () => {
    const sizeStyle: React.CSSProperties = {};
    if (side === 'left' || side === 'right') {
      sizeStyle.width = isMini ? miniWidth : currentSize;
      sizeStyle.height = '100%';
    } else {
      sizeStyle.height = currentSize;
      sizeStyle.width = '100%';
    }
    return sizeStyle;
  };

  const getPositionStyle = () => {
    const style: React.CSSProperties = {
      position: fixed ? 'fixed' : 'absolute',
      [side]: 0,
      top: side === 'bottom' ? 'auto' : 0,
      bottom: side === 'top' ? 'auto' : 0,
    };
    return style;
  };

  // Don't render if behavior doesn't match current viewport
  if ((behavior === 'desktop' && isMobile) || (behavior === 'mobile' && !isMobile)) {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {overlay && !persistent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => !persistent && onClose()}
            />
          )}

          <motion.div
            ref={drawerRef}
            initial={getTransform()}
            animate={{ x: 0, y: 0 }}
            exit={getTransform()}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className={`
              bg-base-100
              ${elevated ? 'shadow-xl' : ''}
              ${bordered ? 'border border-base-300' : ''}
              z-50
              ${className}
            `}
            style={{
              ...getPositionStyle(),
              ...getSizeStyle(),
            }}
          >
            {children}

            {resizable && (
              <div
                className={`absolute w-2 cursor-col-resize hover:bg-primary/20 active:bg-primary/40
                  ${side === 'left' ? 'right-0' : ''}
                  ${side === 'right' ? 'left-0' : ''}
                  ${side === 'top' ? 'bottom-0 w-full h-2 cursor-row-resize' : ''}
                  ${side === 'bottom' ? 'top-0 w-full h-2 cursor-row-resize' : ''}
                  inset-y-0
                `}
                onMouseDown={handleResizeStart}
              />
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Drawer;