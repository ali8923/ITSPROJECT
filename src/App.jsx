import React, { useState, useEffect } from 'react';
import FlippableCard from './components/FlippableCard';
import CardBackView from './components/CardBackView';
import CreateCardModal from './components/CreateCardModal';
import { db } from './db/database';

export default function App() {
  const [vegetables, setVegetables] = useState([]);
  const [selectedVeg, setSelectedVeg] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadCards = async () => {
    const defaultData = await fetch('/vegetables.json').then((res) => res.json());
    const customCards = await db.customCards.toArray();
    const combined = [...defaultData, ...customCards];
    setVegetables(combined);
    if (!selectedVeg && combined.length > 0) setSelectedVeg(combined[0]);
  };

  useEffect(() => {
    loadCards();
  }, []);

  const handleUltraRareTrigger = () => {
    alert("✨ Ultra Rare Secret Unlocked! You found a hidden vegetable variant!");
  };

  return (
    <div className="w-full max-w-md bg-slate-800 min-h-screen shadow-2xl flex flex-col justify-between items-center text-white border-x border-slate-700">
      {/* Header */}
      <header className="w-full p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
        <h1 className="font-black text-lg tracking-wider text-green-400">VegCard Web</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-green-600 hover:bg-green-500 text-white text-xs px-3 py-1.5 rounded-lg font-bold shadow-md transition-all flex items-center gap-1"
        >
          <span>+</span> New Card
        </button>
      </header>

      {/* Main View */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 w-full">
        {selectedVeg ? (
          <div className="flex flex-col items-center">
            <FlippableCard
              frontContent={
                <div className="w-full h-full bg-emerald-50 border-4 border-emerald-800 p-4 flex flex-col justify-between text-slate-800">
                  <div className="flex justify-between items-center border-b-2 border-emerald-800 pb-2">
                    <span className="font-black text-lg">{selectedVeg.name}</span>
                    <span className="bg-emerald-800 text-white text-xs px-2 py-0.5 rounded font-bold">
                      Eco: {selectedVeg.ecoScore}
                    </span>
                  </div>
                  <div className="my-auto text-center py-6 flex flex-col items-center justify-center">
                    {selectedVeg.imageSrc ? (
                      <img src={selectedVeg.imageSrc} alt={selectedVeg.name} className="h-32 object-contain" />
                    ) : (
                      <div className="text-6xl mb-2">🥬</div>
                    )}
                    <p className="text-xs text-slate-600 font-medium italic px-2 mt-2">
                      {selectedVeg.humanBenefits || "Custom collected vegetable card."}
                    </p>
                  </div>
                  <div className="bg-emerald-100 p-2 rounded border border-emerald-300 text-xs">
                    <p><strong>Weakness:</strong> {selectedVeg.weakness || "Weather"}</p>
                    <p><strong>Retreat Cost:</strong> {selectedVeg.retreat || 1}</p>
                  </div>
                </div>
              }
              backContent={<CardBackView />}
              onLongPress={handleUltraRareTrigger}
            />
            <p className="text-xs text-slate-400 mt-2">Tap to flip • Drag to tilt • Hold for Ultra Rare</p>
          </div>
        ) : (
          <p className="text-slate-400">Loading cards...</p>
        )}
      </main>

      {/* Footer Nav */}
      <footer className="w-full p-4 border-t border-slate-700 bg-slate-900/80 flex justify-start space-x-2 overflow-x-auto">
        {vegetables.map((veg) => (
          <button
            key={veg.id || veg.createdAt}
            onClick={() => setSelectedVeg(veg)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${selectedVeg?.name === veg.name
              ? 'bg-green-600 text-white shadow-lg'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
          >
            {veg.name}
          </button>
        ))}
      </footer>

      {/* Modal */}
      <CreateCardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCardCreated={(newCard) => {
          loadCards();
          setSelectedVeg(newCard);
        }}
      />
    </div>
  );
}