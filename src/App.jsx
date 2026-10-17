import React, { useState, useEffect, useRef } from 'react';
import CardBackView from './components/CardBackView';
import { processVegetablePhoto } from './utils/bgRemoval';
import { db } from './db/database';

const VEGETABLES_DATA = [
  { id: "tomato", name: "Tomato", aliases: ["tomato", "番茄", "西紅柿"], ecoScore: 85, humanDamage: 40, ecoDamage: 85, move1Name: "Crimson Shield", humanBenefits: "Lycopene & Vitamin C boost immunity and protect skin cells.", move2Name: "Zero-Mile Transit", environmentalBenefits: "Grown locally to cut down transport pollution.", weakness: "Pests", retreat: 1 },
  { id: "broccoli", name: "Broccoli", aliases: ["broccoli", "西蘭花", "青花菜"], ecoScore: 90, humanDamage: 50, ecoDamage: 110, move1Name: "Iron Bone Impact", humanBenefits: "Iron & Vitamin K build strong blood and bones.", move2Name: "Water Saver", environmentalBenefits: "Saves water compared to other farm crops.", weakness: "Heat", retreat: 1 },
  { id: "choysum", name: "Choy Sum", aliases: ["choysum", "choy sum", "cai xin", "菜心"], ecoScore: 92, humanDamage: 45, ecoDamage: 120, move1Name: "Vitality Sprout", humanBenefits: "Calcium & Vitamin A strengthen bones and boost energy.", move2Name: "Quick Harvest", environmentalBenefits: "Grows super fast for quick local harvests.", weakness: "Frost", retreat: 1 },
  { id: "pakchoi", name: "Pak Choi", aliases: ["pakchoi", "bok choy", "白菜"], ecoScore: 88, humanDamage: 35, ecoDamage: 95, move1Name: "Eagle Vision Beam", humanBenefits: "Beta-carotene & Vitamin C keep vision sharp.", move2Name: "Pure Soil", environmentalBenefits: "Farmed without harsh chemical fertilizers.", weakness: "Insects", retreat: 1 },
  { id: "gailan", name: "Chinese Kale", aliases: ["gailan", "kai lan", "芥蘭"], ecoScore: 89, humanDamage: 55, ecoDamage: 100, move1Name: "Cell Regeneration", humanBenefits: "Vitamin K & Iron improve blood and cell health.", move2Name: "Hardy Roots", environmentalBenefits: "Tough local crop needing very little care.", weakness: "Aphis", retreat: 1 },
  { id: "eggplant", name: "Eggplant", aliases: ["eggplant", "aubergine", "茄子"], ecoScore: 82, humanDamage: 40, ecoDamage: 80, move1Name: "Heart Guard Ray", humanBenefits: "Nasunin & Fiber protect heart and digestion.", move2Name: "Summer Rhythm", environmentalBenefits: "Thrives naturally in warm local summers.", weakness: "Drought", retreat: 2 },
  { id: "bittermelon", name: "Bitter Melon", aliases: ["bittermelon", "bitter gourd", "涼瓜", "苦瓜"], ecoScore: 86, humanDamage: 60, ecoDamage: 90, move1Name: "Inner Purification", humanBenefits: "Charantin & Vitamin C cleanse your system.", move2Name: "Soil Shield", environmentalBenefits: "Climbing vines protect farm soil from sun damage.", weakness: "Rot", retreat: 2 },
  { id: "carrot", name: "Carrot", aliases: ["carrot", "紅蘿蔔", "甘筍"], ecoScore: 87, humanDamage: 50, ecoDamage: 95, move1Name: "Night Stalker Eye", humanBenefits: "Beta-carotene & Vitamin A improve night vision.", move2Name: "Deep Aeration", environmentalBenefits: "Deep roots naturally loosen and aerate the dirt.", weakness: "Rocks", retreat: 1 },
  { id: "radish", name: "White Radish", aliases: ["radish", "daikon", "白蘿蔔"], ecoScore: 84, humanDamage: 35, ecoDamage: 85, move1Name: "Stomach Harmony", humanBenefits: "Glucosinolates & Fiber soothe your stomach.", move2Name: "Cool Season", environmentalBenefits: "Improves soil health during cooler months.", weakness: "Heat", retreat: 1 },
  { id: "pumpkin", name: "Pumpkin", aliases: ["pumpkin", "南瓜"], ecoScore: 91, humanDamage: 65, ecoDamage: 110, move1Name: "Titan Energy Surge", humanBenefits: "Alpha-carotene & Potassium fight sickness and fatigue.", move2Name: "Weed Barrier", environmentalBenefits: "Big leaves block weeds without weedkiller.", weakness: "Mildew", retreat: 2 },
  { id: "cucumber", name: "Cucumber", aliases: ["cucumber", "青瓜", "黃瓜"], ecoScore: 83, humanDamage: 30, ecoDamage: 75, move1Name: "Aqua Skin Splash", humanBenefits: "Water content & Silica hydrate skin and body.", move2Name: "Vertical Grid", environmentalBenefits: "Vertical growing saves precious farm space.", weakness: "Fungus", retreat: 1 },
  { id: "yardlongbean", name: "Yardlong Bean", aliases: ["yardlongbean", "string bean", "豆角", "長豆"], ecoScore: 85, humanDamage: 45, ecoDamage: 90, move1Name: "Endless Stamina", humanBenefits: "Plant protein & Folate give clean energy.", move2Name: "Nitrogen Fix", environmentalBenefits: "Enriches the farm soil naturally.", weakness: "Aphids", retreat: 1 },
  { id: "spinach", name: "Spinach", aliases: ["spinach", "菠菜"], ecoScore: 88, humanDamage: 55, ecoDamage: 105, move1Name: "Popeye Muscle Force", humanBenefits: "Iron & Magnesium build strength and fight fatigue.", move2Name: "Shade Tunnel", environmentalBenefits: "Grown in smart shade tunnels to save water.", weakness: "Sun", retreat: 1 },
  { id: "watercress", name: "Watercress", aliases: ["watercress", "西洋菜"], ecoScore: 90, humanDamage: 40, ecoDamage: 100, move1Name: "Wetland Vitality", humanBenefits: "Glucosinolates & Minerals provide daily vitality.", move2Name: "Wetland Care", environmentalBenefits: "Supports clean wetland farming habitats.", weakness: "Pollution", retreat: 1 },
  { id: "sweetpotato", name: "Sweet Potato", aliases: ["sweet potato", "番薯", "地瓜"], ecoScore: 93, humanDamage: 70, ecoDamage: 125, move1Name: "Metabolic Turbo", humanBenefits: "Complex carbs & Vitamin B6 keep you active.", move2Name: "Soil Anchor", environmentalBenefits: "Stops soil wash away during heavy rains.", weakness: "Weevils", retreat: 1 },
  { id: "wintermelon", name: "Winter Melon", aliases: ["winter melon", "冬瓜"], ecoScore: 86, humanDamage: 35, ecoDamage: 95, move1Name: "Frost Chill Wave", humanBenefits: "Potassium & Water cool down body heat.", move2Name: "Massive Yield", environmentalBenefits: "Produces massive food yields from single vines.", weakness: "Heavy Rain", retreat: 2 },
  { id: "lettuce", name: "Lettuce", aliases: ["lettuce", "生菜"], ecoScore: 81, humanDamage: 30, ecoDamage: 75, move1Name: "Pure Leaf Cleanse", humanBenefits: "Folate & Vitamin K support clean eating.", move2Name: "Rapid Grow", environmentalBenefits: "Harvested quickly to maximize land use.", weakness: "Heat", retreat: 1 },
  { id: "springonion", name: "Spring Onion", aliases: ["spring onion", "scallion", "蔥", "青蔥"], ecoScore: 80, humanDamage: 40, ecoDamage: 80, move1Name: "Germ Blaster", humanBenefits: "Allicin & Vitamin C fight germs and flavor.", move2Name: "Pest Guard", environmentalBenefits: "Naturally scares away bugs from neighbor crops.", weakness: "Rot", retreat: 1 },
  { id: "waterspinach", name: "Water Spinach", aliases: ["water spinach", "ong choy", "通菜", "空心菜"], ecoScore: 87, humanDamage: 45, ecoDamage: 100, move1Name: "Flex Muscle Wave", humanBenefits: "Iron & Vitamin A keep muscles feeling great.", move2Name: "Zero Spray", environmentalBenefits: "Grows strong in local humidity with zero sprays.", weakness: "Frost", retreat: 1 },
  { id: "napacabbage", name: "Napa Cabbage", aliases: ["napa cabbage", "chinese cabbage", "黃芽白", "大白菜"], ecoScore: 85, humanDamage: 40, ecoDamage: 90, move1Name: "Smooth Digestion Flow", humanBenefits: "Fiber & Vitamin C aid digestion smoothly.", move2Name: "Winter Classic", environmentalBenefits: "Classic local winter crop favorite.", weakness: "Slugs", retreat: 2 }
];

const getSecretArt = (vegId) => {
  if (!vegId) return '/secret_arts/tomato_secret.jpg';
  const key = vegId.toLowerCase().trim();
  return `/secret_arts/${key}_secret.jpg`;
};

const strictMatchVegetable = (inputName) => {
  if (!inputName) return null;
  const query = inputName.toLowerCase().trim();

  const found = VEGETABLES_DATA.find(v =>
    v.id.toLowerCase() === query ||
    v.name.toLowerCase() === query ||
    v.aliases.some(alias => alias.toLowerCase() === query)
  );

  if (found) return found;

  const partial = VEGETABLES_DATA.find(v =>
    v.aliases.some(alias => query.includes(alias.toLowerCase()) || alias.toLowerCase().includes(query))
  );

  return partial || null;
};

function CardFrontUI({ card, isUltra = false, secretArtUrl = null }) {
  if (isUltra) {
    return (
      <div style={{
        width: '340px', height: '490px', borderRadius: '24px', overflow: 'hidden',
        border: '6px solid #fbbf24', boxShadow: '0 25px 30px rgba(0,0,0,0.7)',
        position: 'relative', padding: '16px', display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', backgroundColor: '#000', boxSizing: 'border-box', userSelect: 'none'
      }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <img
            src={secretArtUrl}
            alt="Secret Art"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              e.target.src = '/secret_arts/tomato_secret.jpg';
            }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
          <div style={{ textAlign: 'left' }}>
            <span style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '1px', color: '#fbbf24', display: 'block' }}>ULTRA</span>
            <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#fff', margin: 0, lineHeight: 1 }}>{card.name}</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '13px', fontWeight: '800', color: '#fbbf24' }}>ECO</span>
            <span style={{ fontSize: '22px', fontWeight: '900', color: '#fff' }}>{card.ecoScore}</span>
            <div style={{ width: '22px', height: '22px', background: '#ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>🌿</div>
          </div>
        </div>

        <div style={{ flex: 1 }} />

        <div style={{ position: 'relative', zIndex: 1, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', padding: '10px', borderRadius: '14px', border: '1px solid rgba(251,191,36,0.5)', width: '100%', boxSizing: 'border-box' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '12px', height: '12px', background: '#ef4444', borderRadius: '50%', display: 'inline-block' }} />
                <span style={{ fontSize: '13px', fontWeight: '900', color: '#fbbf24' }}>{card.move1Name}</span>
              </div>
              <span style={{ fontSize: '16px', fontWeight: '900', color: '#fff' }}>{card.humanDamage}</span>
            </div>
            <p style={{ fontSize: '9px', color: '#e2e8f0', margin: '3px 0 8px 18px', textAlign: 'left' }}>
              {card.humanBenefits}
            </p>
          </div>

          <div style={{ height: '1px', background: 'rgba(255,255,255,0.2)', margin: '6px 0' }} />

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '12px', height: '12px', background: '#ef4444', borderRadius: '50%', display: 'inline-block' }} />
                <span style={{ width: '12px', height: '12px', background: '#f87171', borderRadius: '50%', display: 'inline-block' }} />
                <span style={{ fontSize: '13px', fontWeight: '900', color: '#fbbf24' }}>{card.move2Name}</span>
              </div>
              <span style={{ fontSize: '16px', fontWeight: '900', color: '#fff' }}>{card.ecoDamage}</span>
            </div>
            <p style={{ fontSize: '9px', color: '#e2e8f0', margin: '3px 0 0 18px', textAlign: 'left' }}>
              {card.environmentalBenefits}
            </p>
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 1, borderTop: '1px solid rgba(251,191,36,0.4)', paddingTop: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', fontWeight: 'bold', color: '#fef08a', textTransform: 'uppercase' }}>
            <div>WEAKNESS <span style={{ color: '#fff' }}>{card.weakness} x2</span></div>
            <div>RETREAT <span style={{ color: '#fbbf24' }}>{'⭐'.repeat(card.retreat || 1)}</span></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px', color: 'rgba(254,240,138,0.7)', marginTop: '2px' }}>
            <span>★ ULTRA RARE • illus. VegCard AI</span>
            <span>NO. 085</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      width: '340px', height: '490px', borderRadius: '24px', overflow: 'hidden',
      border: '6px solid #fed7d7', boxShadow: '0 25px 30px rgba(0,0,0,0.6)',
      position: 'relative', padding: '16px', display: 'flex', flexDirection: 'column',
      justifyContent: 'space-between', backgroundColor: '#fff5f5', boxSizing: 'border-box', userSelect: 'none'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
        <div style={{ textAlign: 'left' }}>
          <span style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '1px', color: '#dc2626', display: 'block' }}>BASIC</span>
          <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#000', margin: 0, lineHeight: 1 }}>{card.name}</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '13px', fontWeight: '800', color: '#dc2626' }}>ECO</span>
          <span style={{ fontSize: '22px', fontWeight: '900', color: '#000' }}>{card.ecoScore}</span>
          <div style={{ width: '22px', height: '22px', background: '#ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>🌿</div>
        </div>
      </div>

      <div style={{ width: '100%', height: '175px', background: '#ffe4e6', borderRadius: '16px', border: '1px solid #fecdd3', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        {card.imageSrc ? (
          <img
            src={card.imageSrc}
            alt={card.name}
            style={{ height: '100%', width: '100%', objectFit: 'contain', zIndex: '1' }}
            onError={(e) => {
              e.target.style.display = 'none';
              if (e.target.nextSibling) {
                e.target.nextSibling.style.display = 'block';
              }
            }}
          />
        ) : null}
        <div style={{ fontSize: '48px', display: card.imageSrc ? 'none' : 'block', position: 'absolute', zIndex: '2' }}>🍅</div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.9)', padding: '10px', borderRadius: '14px', border: '1px solid #fecdd3', width: '100%', boxSizing: 'border-box' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', background: '#ef4444', borderRadius: '50%', display: 'inline-block' }} />
              <span style={{ fontSize: '13px', fontWeight: '900', color: '#000' }}>{card.move1Name}</span>
            </div>
            <span style={{ fontSize: '16px', fontWeight: '900', color: '#000' }}>{card.humanDamage}</span>
          </div>
          <p style={{ fontSize: '9px', color: '#4b5563', margin: '3px 0 8px 18px', textAlign: 'left' }}>
            {card.humanBenefits}
          </p>
        </div>

        <div style={{ height: '1px', background: '#fee2e2', margin: '6px 0' }} />

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', background: '#ef4444', borderRadius: '50%', display: 'inline-block' }} />
              <span style={{ width: '12px', height: '12px', background: '#f87171', borderRadius: '50%', display: 'inline-block' }} />
              <span style={{ fontSize: '13px', fontWeight: '900', color: '#000' }}>{card.move2Name}</span>
            </div>
            <span style={{ fontSize: '16px', fontWeight: '900', color: '#000' }}>{card.ecoDamage}</span>
          </div>
          <p style={{ fontSize: '9px', color: '#4b5563', margin: '3px 0 0 18px', textAlign: 'left' }}>
            {card.environmentalBenefits}
          </p>
        </div>
      </div>

      <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '6px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', fontWeight: 'bold', color: '#334155', textTransform: 'uppercase' }}>
          <div>WEAKNESS <span style={{ color: '#000' }}>{card.weakness} x2</span></div>
          <div>RETREAT <span style={{ color: '#d97706' }}>{'⭐'.repeat(card.retreat || 1)}</span></div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px', color: '#64748b', marginTop: '2px' }}>
          <span>★ Rare Harvest • illus. VegCard AI</span>
          <span>NO. 085</span>
        </div>
      </div>
    </div>
  );
}

function FlippableCard({ card, secretArtUrl }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isUltra, setIsUltra] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [startPos, setStartPos] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const timerRef = useRef(null);

  const handleStart = (e) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setStartPos({ x: clientX, y: clientY });
    setDragOffset({ x: 0, y: 0 });

    timerRef.current = setTimeout(() => {
      setIsAnimating(true);
      setIsUltra(prev => !prev);

      setTimeout(() => {
        setIsAnimating(false);
      }, 600);
    }, 500);
  };

  const handleMove = (e) => {
    if (!startPos) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const diffX = clientX - startPos.x;
    const diffY = clientY - startPos.y;

    setDragOffset({ x: diffX, y: diffY });

    if ((Math.abs(diffX) > 8 || Math.abs(diffY) > 8) && timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleEnd = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (Math.abs(dragOffset.x) > 60) {
      setIsFlipped(prev => !prev);
    }
    setStartPos(null);
    setDragOffset({ x: 0, y: 0 });
  };

  const rotateY = isAnimating
    ? 360
    : (isFlipped ? 180 : 0) + (dragOffset.x / 300) * 180;

  const rotateX = isAnimating ? 0 : -(dragOffset.y / 300) * 40;

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
        transition: isAnimating
          ? 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'
          : (startPos !== null ? 'none' : 'transform 0.4s ease-out'),
        transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
      }}>
        <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
          <CardFrontUI card={card} isUltra={isUltra} secretArtUrl={secretArtUrl} />
        </div>
        <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
          <CardBackView />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [currentTab, setCurrentTab] = useState('home');
  const [vegetables, setVegetables] = useState([]);
  const [inputName, setInputName] = useState('');
  const [imageSrc, setImageSrc] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewCard, setPreviewCard] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);

  const loadCards = async () => {
    try {
      const customCards = await db.customCards.toArray();
      setVegetables(customCards);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadCards();
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsProcessing(true);
    const processedUrl = await processVegetablePhoto(file);
    setImageSrc(processedUrl);
    setIsProcessing(false);
  };

  const handleGenerateCard = () => {
    if (!imageSrc) {
      alert("請先上傳或拍攝蔬菜照片！");
      return;
    }

    if (!inputName) {
      alert("DATA NOT FOUND");
      return;
    }

    const matchedVeg = strictMatchVegetable(inputName);

    if (!matchedVeg) {
      alert("DATA NOT FOUND");
      return;
    }

    const newCard = {
      vegId: matchedVeg.id,
      name: matchedVeg.name,
      imageSrc,
      ecoScore: matchedVeg.ecoScore,
      humanDamage: matchedVeg.humanDamage,
      ecoDamage: matchedVeg.ecoDamage,
      humanBenefits: matchedVeg.humanBenefits,
      environmentalBenefits: matchedVeg.environmentalBenefits,
      move1Name: matchedVeg.move1Name,
      move2Name: matchedVeg.move2Name,
      weakness: matchedVeg.weakness,
      retreat: matchedVeg.retreat,
      createdAt: new Date().toISOString()
    };

    setPreviewCard(newCard);
    setCurrentTab('preview');
  };

  const handleSaveToCollection = async () => {
    if (previewCard) {
      await db.customCards.add(previewCard);
      await loadCards();
      alert("已成功儲存至 Collection！");
      setSelectedCard(null);
      setCurrentTab('collection');
    }
  };

  const handleDeleteCard = async (id, e) => {
    e.stopPropagation();
    if (window.confirm("確定要刪除這張卡片嗎？")) {
      await db.customCards.delete(id);
      await loadCards();
      setSelectedCard(null);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '420px', margin: '0 auto', background: '#0a0a0a', minHeight: '100vh', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontFamily: '-apple-system, sans-serif' }}>

      {/* Header */}
      <header style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #222' }}>
        {currentTab !== 'home' ? (
          <button onClick={() => { setCurrentTab('home'); setSelectedCard(null); }} style={{ background: 'none', border: 'none', color: '#f97316', fontWeight: 'bold', cursor: 'pointer' }}>
            ‹ Welcome
          </button>
        ) : <span style={{ fontSize: '12px', color: '#888' }}>Welcome</span>}
        <h1 style={{ fontSize: '14px', fontWeight: 'bold', textTransform: 'capitalize', margin: 0 }}>{currentTab}</h1>
        <div style={{ width: '40px' }} />
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflowY: 'auto' }}>

        {currentTab === 'home' && (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '80px', height: '80px', background: 'rgba(34, 197, 94, 0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(34, 197, 94, 0.4)', fontSize: '32px' }}>
              🌿
            </div>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '900', margin: '0 0 8px 0' }}>VegCard</h2>
              <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>Collect & Battle Organic Veggies</p>
            </div>
            <button
              onClick={() => setCurrentTab('create')}
              style={{ width: '260px', padding: '14px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}
            >
              Create New Card
            </button>
          </div>
        )}

        {currentTab === 'create' && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#888', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>VEGETABLE PHOTO</label>
              <label style={{ width: '100%', height: '180px', background: '#111', border: '2px dashed #333', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                {imageSrc && !isProcessing ? (
                  <img src={imageSrc} alt="Preview" style={{ height: '100%', objectFit: 'contain', padding: '8px' }} />
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '28px' }}>📷</div>
                    <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#fff', margin: '8px 0 0 0' }}>Tap to take photo or choose</p>
                  </div>
                )}
                {isProcessing && <p style={{ fontSize: '12px', color: '#fbbf24', margin: '8px 0 0 0' }}>AI Background Removal...</p>}
                {/* 加上 capture="environment" 讓手機可以直接開啟相機拍照 */}
                <input type="file" accept="image/*" capture="environment" onChange={handleImageUpload} style={{ display: 'none' }} />
              </label>
            </div>

            <div>
              <label style={{ fontSize: '12px', color: '#888', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>VEGETABLE IDENTIFICATION</label>
              <input
                type="text"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                placeholder="Name (e.g. Tomato / 番茄 / 西紅柿)"
                style={{ width: '100%', background: '#111', border: '1px solid #333', borderRadius: '12px', padding: '12px', fontSize: '14px', color: '#fff', boxSizing: 'border-box' }}
              />
            </div>

            <button
              onClick={handleGenerateCard}
              style={{ width: '100%', padding: '14px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}
            >
              Generate Card
            </button>
          </div>
        )}

        {currentTab === 'preview' && previewCard && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <FlippableCard card={previewCard} secretArtUrl={getSecretArt(previewCard.vegId)} />

            <p style={{ fontSize: '11px', color: '#fbbf24', textAlign: 'center', fontWeight: 'bold', margin: 0 }}>
              🔒 Click & hold card for 0.5s to reveal Ultra Secret Rare...
            </p>

            <button
              onClick={handleSaveToCollection}
              style={{ width: '340px', padding: '12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
            >
              Save to Collection
            </button>
          </div>
        )}

        {currentTab === 'collection' && !selectedCard && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <h3 style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', margin: 0 }}>Your Collection ({vegetables.length})</h3>

            {vegetables.length === 0 ? (
              <div style={{ textAlign: 'center', marginTop: '60px', color: '#666' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🌿</div>
                <h4 style={{ fontSize: '18px', color: '#fff', margin: '0 0 6px 0' }}>No Cards Yet</h4>
                <p style={{ fontSize: '12px', margin: 0 }}>Create your first organic vegetable card!</p>
              </div>
            ) : (
              vegetables.map((veg, idx) => (
                <div
                  key={veg.id || idx}
                  onClick={() => setSelectedCard(veg)}
                  style={{ background: '#111', border: '1px solid #333', borderRadius: '16px', padding: '16px', width: '320px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '50px', height: '50px', background: '#222', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid #333' }}>
                      {veg.imageSrc ? (
                        <img
                          src={veg.imageSrc}
                          alt={veg.name}
                          style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                      ) : null}
                      <span style={{ fontSize: '24px', display: veg.imageSrc ? 'none' : 'block' }}>🍅</span>
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', color: '#fff' }}>{veg.name}</h4>
                      <p style={{ margin: 0, fontSize: '11px', color: '#16a34a', fontWeight: 'bold' }}>ECO Score: {veg.ecoScore}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDeleteCard(veg.id, e)}
                    style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', padding: '6px 10px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {currentTab === 'collection' && selectedCard && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <FlippableCard card={selectedCard} secretArtUrl={getSecretArt(selectedCard.vegId)} />

            <p style={{ fontSize: '11px', color: '#fbbf24', textAlign: 'center', fontWeight: 'bold', margin: 0 }}>
              🔒 Click & hold card for 0.5s to reveal Ultra Secret Rare...
            </p>

            <div style={{ display: 'flex', gap: '10px', width: '340px' }}>
              <button
                onClick={(e) => handleDeleteCard(selectedCard.id, e)}
                style={{ flex: 1, padding: '12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
              >
                Delete Card
              </button>
              <button
                onClick={() => setSelectedCard(null)}
                style={{ flex: 1, padding: '12px', background: '#334155', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
              >
                Back to List
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Footer Navigation */}
      <footer style={{ padding: '12px', borderTop: '1px solid #222', background: '#000', display: 'flex', justifyContent: 'space-around' }}>
        <button onClick={() => { setCurrentTab('home'); setSelectedCard(null); }} style={{ background: 'none', border: 'none', color: currentTab === 'home' ? '#3b82f6' : '#666', cursor: 'pointer', flex: 1, textAlign: 'center', fontSize: '12px', fontWeight: 'bold' }}>
          🏠 Home
        </button>
        <button onClick={() => { setCurrentTab('collection'); setSelectedCard(null); }} style={{ background: 'none', border: 'none', color: currentTab === 'collection' ? '#3b82f6' : '#666', cursor: 'pointer', flex: 1, textAlign: 'center', fontSize: '12px', fontWeight: 'bold' }}>
          🗂️ Collection
        </button>
      </footer>

    </div>
  );
}