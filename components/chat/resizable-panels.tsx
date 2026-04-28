'use client';

import { useEffect, useRef, useState } from 'react';

interface ResizablePanelsProps {
  children: [React.ReactNode, React.ReactNode];
  defaultLeftWidth?: number;
  minLeftWidth?: number;
  maxLeftWidth?: number;
  storageKey?: string;
  sidebarOpen?: boolean;
}

export function ResizablePanels({
  children,
  defaultLeftWidth = 33,
  minLeftWidth = 25,
  maxLeftWidth = 50,
  storageKey = 'chat-panel-width',
  sidebarOpen = true,
}: ResizablePanelsProps) {
  const [leftWidth, setLeftWidth] = useState(defaultLeftWidth);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const parsed = parseFloat(saved);
      if (parsed >= minLeftWidth && parsed <= maxLeftWidth) {
        setLeftWidth(parsed);
      }
    }
  }, [storageKey, minLeftWidth, maxLeftWidth]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

      if (newWidth >= minLeftWidth && newWidth <= maxLeftWidth) {
        setLeftWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      localStorage.setItem(storageKey, leftWidth.toString());
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, storageKey, leftWidth, minLeftWidth, maxLeftWidth]);

  return (
    <div
      ref={containerRef}
      className="flex h-full w-full select-none overflow-hidden"
      style={{ userSelect: isDragging ? 'none' : 'auto' }}
    >
      {/* Left Panel */}
      <div
        style={{
          width: sidebarOpen ? `${leftWidth}%` : '0%',
          overflow: 'hidden',
          transition: 'width 200ms ease-in-out',
        }}
        className="flex h-full min-h-0 flex-col"
      >
        {children[0]}
      </div>

      {/* Resize Handle — hidden when sidebar is collapsed */}
      <div
        onMouseDown={() => sidebarOpen && setIsDragging(true)}
        className="group relative flex w-px shrink-0 cursor-col-resize items-center justify-center bg-transparent"
        role="separator"
        aria-label="Resize panels"
        aria-orientation="vertical"
        style={{ display: sidebarOpen ? undefined : 'none' }}
      >
        {/* Wider hit area */}
        <div className="absolute inset-y-0 -left-2 -right-2" />
      </div>

      {/* Right Panel */}
      <div className="flex h-full min-h-0 flex-1 flex-col">
        {children[1]}
      </div>
    </div>
  );
}
