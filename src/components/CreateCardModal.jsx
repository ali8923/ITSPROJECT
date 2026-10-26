import React, { useState } from 'react';
import { processVegetablePhoto } from '../utils/bgRemoval';
import { db } from '../db/database';

export default function CreateCardModal({ isOpen, onClose, onCardCreated }) {
    const [name, setName] = useState('');
    const [colorTheme, setColorTheme] = useState('green');
    const [imageSrc, setImageSrc] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    if (!isOpen) return null;

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsProcessing(true);
        const processedUrl = await processVegetablePhoto(file);
        setImageSrc(processedUrl);
        setIsProcessing(false);
    };

    const handleSave = async () => {
        if (!name || !imageSrc) {
            alert("Please enter a name and select a photo!");
            return;
        }

        const newCard = {
            name,
            colorTheme,
            imageSrc,
            ecoScore: Math.floor(Math.random() * 20) + 80,
            createdAt: new Date().toISOString()
        };

        await db.customCards.add(newCard);
        if (onCardCreated) onCardCreated(newCard);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-sm text-white space-y-4">
                <h2 className="text-lg font-bold text-green-400">📸 Create New VegCard</h2>

                <div>
                    <label className="text-xs text-slate-400 block mb-1">Vegetable Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Fresh Carrot"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-green-500"
                    />
                </div>

                <div>
                    <label className="text-xs text-slate-400 block mb-1">Upload / Take Photo</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-green-600 file:text-white file:font-semibold hover:file:bg-green-500 cursor-pointer"
                    />
                </div>

                {isProcessing && (
                    <div className="text-center text-xs text-amber-400 animate-pulse">
                        🤖 AI Removing Background...
                    </div>
                )}

                {imageSrc && !isProcessing && (
                    <div className="w-full h-36 bg-slate-900 rounded-lg p-2 flex items-center justify-center border border-slate-700 overflow-hidden">
                        <img src={imageSrc} alt="Preview" className="max-h-full object-contain" />
                    </div>
                )}

                <div className="flex space-x-2 pt-2">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-bold"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isProcessing}
                        className="flex-1 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-xs font-bold shadow-lg disabled:opacity-50"
                    >
                        Save Card
                    </button>
                </div>
            </div>
        </div>
    );
}