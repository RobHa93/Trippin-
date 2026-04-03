import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import TripPlanner from './pages/tripPlanner';
import TripResult from './pages/tripResult';

function SplashScreen({ onDone }) {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), 2200);
    const doneTimer = setTimeout(() => onDone(), 2800);
    return () => { clearTimeout(fadeTimer); clearTimeout(doneTimer); };
  }, [onDone]);

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'linear-gradient(135deg, #fff7ed 0%, #fce7f3 50%, #ede9fe 100%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        transition: 'opacity 0.6s ease',
        opacity: fading ? 0 : 1,
        pointerEvents: fading ? 'none' : 'all',
      }}
    >
      <style>{`
        .sp-scene {
          width: 240px; height: 120px;
          position: relative;
          display: flex; flex-direction: column;
          align-items: center; justify-content: flex-end;
          overflow: hidden;
        }
        .sp-plane {
          position: absolute; top: 12px; left: 50%;
          font-size: 56px; line-height: 1;
          filter: drop-shadow(0 4px 10px rgba(0,0,0,0.15));
          animation: sp-bob 1s ease-in-out infinite;
          transform-origin: center;
        }
        @keyframes sp-bob {
          0%   { transform: translateX(-50%) translateY(0)   rotate(-4deg); }
          50%  { transform: translateX(-50%) translateY(7px) rotate(4deg);  }
          100% { transform: translateX(-50%) translateY(0)   rotate(-4deg); }
        }
        .sp-cloud {
          position: absolute;
          border-radius: 9999px;
          background: white;
          animation: sp-cloud linear infinite;
        }
        .sp-cloud::before, .sp-cloud::after {
          content: ''; position: absolute;
          background: white; border-radius: 9999px;
        }
        .sp-c1 { width:52px; height:17px; top:16px; right:-60px; animation-duration:3s;   opacity:.85; }
        .sp-c1::before { width:24px; height:24px; top:-11px; left:8px;  }
        .sp-c1::after  { width:18px; height:18px; top:-7px;  left:26px; }
        .sp-c2 { width:38px; height:13px; top:38px; right:-40px; animation-duration:2.4s; animation-delay:-.9s; opacity:.65; }
        .sp-c2::before { width:17px; height:17px; top:-8px; left:6px;  }
        .sp-c2::after  { width:13px; height:13px; top:-5px; left:18px; }
        .sp-c3 { width:62px; height:19px; top:8px;  right:-70px; animation-duration:3.8s; animation-delay:-1.8s; opacity:.7; }
        .sp-c3::before { width:28px; height:28px; top:-13px; left:10px; }
        .sp-c3::after  { width:20px; height:20px; top:-8px;  left:32px; }
        @keyframes sp-cloud {
          0%   { transform: translateX(0);      }
          100% { transform: translateX(-360px); }
        }
        .sp-runway {
          width: 100%; height: 2px;
          background: #d1d5db; border-radius: 3px;
          position: absolute; bottom: 0;
        }
        .sp-runway::before {
          content: ''; position: absolute;
          width: 24px; height: 100%;
          background: #d1d5db; border-left: 10px solid transparent;
          right: -40%; border-radius: 3px;
          animation: sp-road 1.4s linear infinite;
        }
        .sp-runway::after {
          content: ''; position: absolute;
          width: 12px; height: 100%;
          background: #d1d5db; border-left: 5px solid transparent;
          right: -65%; border-radius: 3px;
          animation: sp-road 1.4s linear infinite;
        }
        @keyframes sp-road {
          0%   { transform: translateX(0);      }
          100% { transform: translateX(-350px); }
        }
      `}</style>

      <div className="sp-scene">
        <div className="sp-cloud sp-c1" />
        <div className="sp-cloud sp-c2" />
        <div className="sp-cloud sp-c3" />
        <div className="sp-plane">✈️</div>
        <div className="sp-runway" />
      </div>

      <div style={{ marginTop: 28, textAlign: 'center' }}>
        <div style={{
          fontSize: 32, fontWeight: 700, letterSpacing: '-0.5px',
          background: 'linear-gradient(to right, #ea580c, #db2777, #7c3aed)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
        }}>
          ✈️ Trippin'
        </div>
        <div style={{ color: '#9ca3af', fontSize: 13, marginTop: 6 }}>
          Dein KI-Reiseplaner
        </div>
      </div>
    </div>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/planner" element={<TripPlanner />} />
          <Route path="/result" element={<TripResult />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
