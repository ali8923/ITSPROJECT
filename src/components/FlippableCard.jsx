import React, { useState } from 'react';

export default function FlippableCard({ frontContent, backContent, onLongPress, width = 310, height = 440 }) {
    const [isFlipped, setIsFlipped] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    let pressTimer = null;

    const handleStart = () => {
        setIsDragging(true);
        pressTimer = setTimeout(() => {
            if (onLongPress) onLongPress();
        }, 600);
    };

    const handleMove = (e) => {
        if (!isDragging) return;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        setDragOffset({
            x: (clientX - window.innerWidth / 2) / 8,
            y: (clientY - window.innerHeight / 2) / 8
        });
    };

    const handleEnd = () => {
        setIsDragging(false);
        clearTimeout(pressTimer);
        setDragOffset({ x: 0, y: 0 });
    };

    return (
        <div
            className="perspective-1000 cursor-pointer select-none my-4"
            style={{ width, height }}
            onMouseDown={handleStart}
            onMouseMove={handleMove}
            onMouseUp={handleEnd}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
            onClick={() => setIsFlipped(!isFlipped)}
        >
            <div
                className={`relative w-full h-full duration-300 transition-transform transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}
                style={{
                    transform: `perspective(1000px) rotateY(${isFlipped ? 180 : dragOffset.x}deg) rotateX(${-dragOffset.y}deg) scale(${isDragging ? 1.03 : 1.0})`
                }}
            >
                <div className="absolute inset-0 backface-hidden shadow-2xl rounded-2xl overflow-hidden">
                    {frontContent}
                </div>
                <div className="absolute inset-0 backface-hidden rotate-y-180 shadow-2xl rounded-2xl overflow-hidden">
                    {backContent}
                </div>
            </div>
        </div>
    );
}