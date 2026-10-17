import React, { useState, useRef } from 'react';

export default function FlippableCard({ frontContent, ultraContent, backContent }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isUltra, setIsUltra] = useState(false);
  const [startX, setStartX] = useState(null);
  const [dragX, setDragX] = useState(0);
  const timerRef = useRef(null);

  const handleStart = (e) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    setStartX(clientX);
    setDragX(0);

    // 按住不放 500ms 直接切換成 Ultra 卡片！
    timerRef.current = setTimeout(() => {
      setIsUltra(prev => !prev);
    }, 500);
  };

  const handleMove = (e) => {
    if (startX === null) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const diff = clientX - startX;
    setDragX(diff);

    // 如果手指或滑鼠開始拖曳移動，取消長按計時
    if (Math.abs(diff) > 8 && timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleEnd = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (Math.abs(dragX) > 60) {
      setIsFlipped(prev => !prev);
    }
    setStartX(null);
    setDragX(0);
  };

  const rotation = (isFlipped ? 180 : 0) + (dragX / 300) * 180;

  return (
    <div 
      onMouseDown={handleStart}
      onMouseMove={handleMove}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
      style={{
        width: '340px',
        height: '490px',
        perspective: '1200px',
        cursor: 'grab',
        userSelect: 'none',
        margin: '10px 0'
      }}
    >
      <div style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        transformStyle: 'preserve-3d',
        transition: startX !== null ? 'none' : 'transform 0.4s ease-out',
        transform: `rotateY(${rotation}deg)`
      }}>
        {/* 正面：根據 isUltra 狀態自動切換一般版或閃卡版 */}
        <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
          {isUltra && ultraContent ? ultraContent : frontContent}
        </div>
        {/* 背面 */}
        <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
          {backContent}
        </div>
      </div>
    </div>
  );
}