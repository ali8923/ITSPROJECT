import React from 'react';

export default function CardBackView() {
  return (
    <div style={{
      width: '340px',
      height: '490px',
      backgroundColor: '#14532d',
      borderRadius: '24px',
      border: '6px solid #052e16',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      boxSizing: 'border-box',
      boxShadow: '0 25px 30px rgba(0, 0, 0, 0.7)',
      position: 'relative',
      overflow: 'hidden',
      userSelect: 'none'
    }}>
      <div style={{ position: 'absolute', inset: '14px', border: '2px solid rgba(255,255,255,0.4)', borderRadius: '16px', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: '18px', border: '1px solid rgba(0,0,0,0.3)', borderRadius: '12px', pointerEvents: 'none' }} />
      <div style={{ width: '90px', height: '90px', background: 'rgba(255,255,255,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 4px 6px rgba(0,0,0,0.3)' }}>
        <div style={{ width: '64px', height: '64px', background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
          🌿
        </div>
      </div>
      <h2 style={{ color: '#fff', fontWeight: '900', fontSize: '15px', letterSpacing: '0.3em', marginTop: '16px', textShadow: '0 2px 4px rgba(0,0,0,0.4)' }}>VEGCARD</h2>
    </div>
  );
}