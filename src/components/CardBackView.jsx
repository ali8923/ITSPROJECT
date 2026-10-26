import React from 'react';

export default function CardBackView({ width = 310, height = 440 }) {
    return (
        <div className="bg-green-600 rounded-2xl border-4 border-black/80 p-4 flex flex-col justify-center items-center shadow-xl relative overflow-hidden" style={{ width, height }}>
            <div className="absolute inset-2 border-2 border-white/60 rounded-xl pointer-events-none" />
            <div className="absolute inset-3 border border-black/30 rounded-lg pointer-events-none" />

            <div className="flex flex-col items-center space-y-3 z-10">
                <div className="relative flex items-center justify-center w-20 h-20 bg-white/20 rounded-full">
                    <div className="w-14 h-14 bg-white rounded-full shadow-md flex items-center justify-center">
                        <span className="text-green-600 text-2xl font-bold">🌿</span>
                    </div>
                </div>
                <h2 className="text-white font-black text-sm tracking-[0.25em]">VEGCARD</h2>
            </div>
        </div>
    );
}