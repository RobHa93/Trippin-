import React from 'react';

export default function LoadingSpinner({ text = 'Lädt...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 select-none">
      <style>{`
        .plane-loader {
          width: 220px;
          height: 110px;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
          overflow: hidden;
        }

        /* Plane body bobs up/down */
        .plane-body {
          position: absolute;
          top: 8px;
          left: 50%;
          transform: translateX(-50%);
          animation: planeBob 1s ease-in-out infinite;
          z-index: 10;
          font-size: 52px;
          line-height: 1;
          filter: drop-shadow(0 4px 8px rgba(0,0,0,0.18));
        }
        @keyframes planeBob {
          0%   { transform: translateX(-50%) translateY(0px) rotate(-3deg); }
          50%  { transform: translateX(-50%) translateY(6px) rotate(3deg); }
          100% { transform: translateX(-50%) translateY(0px) rotate(-3deg); }
        }

        /* Road / runway line */
        .runway {
          width: 100%;
          height: 2px;
          background: #cbd5e1;
          border-radius: 3px;
          position: absolute;
          bottom: 0;
        }
        .runway::before {
          content: '';
          position: absolute;
          width: 24px;
          height: 100%;
          background: #cbd5e1;
          right: -40%;
          border-left: 10px solid white;
          border-radius: 3px;
          animation: runwayAnim 1.4s linear infinite;
        }
        .runway::after {
          content: '';
          position: absolute;
          width: 12px;
          height: 100%;
          background: #cbd5e1;
          right: -65%;
          border-left: 5px solid white;
          border-radius: 3px;
          animation: runwayAnim 1.4s linear infinite;
        }
        @keyframes runwayAnim {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-350px); }
        }

        /* Clouds scroll from right to left */
        .cloud {
          position: absolute;
          border-radius: 9999px;
          background: white;
          opacity: 0.85;
          animation: cloudMove linear infinite;
        }
        .cloud::before, .cloud::after {
          content: '';
          position: absolute;
          background: white;
          border-radius: 9999px;
        }

        /* Cloud 1 */
        .cloud-1 {
          width: 50px; height: 16px;
          top: 18px; right: -60px;
          animation-duration: 3.2s;
          animation-delay: 0s;
        }
        .cloud-1::before { width: 22px; height: 22px; top: -10px; left: 8px; }
        .cloud-1::after  { width: 16px; height: 16px; top: -6px;  left: 24px; }

        /* Cloud 2 */
        .cloud-2 {
          width: 38px; height: 12px;
          top: 40px; right: -50px;
          animation-duration: 2.6s;
          animation-delay: -1.1s;
          opacity: 0.6;
        }
        .cloud-2::before { width: 16px; height: 16px; top: -8px; left: 6px; }
        .cloud-2::after  { width: 12px; height: 12px; top: -5px; left: 18px; }

        /* Cloud 3 */
        .cloud-3 {
          width: 60px; height: 18px;
          top: 10px; right: -70px;
          animation-duration: 4s;
          animation-delay: -2s;
          opacity: 0.7;
        }
        .cloud-3::before { width: 26px; height: 26px; top: -13px; left: 10px; }
        .cloud-3::after  { width: 20px; height: 20px; top: -8px;  left: 30px; }

        @keyframes cloudMove {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-320px); }
        }
      `}</style>

      <div className="plane-loader">
        {/* Scrolling clouds */}
        <div className="cloud cloud-1" />
        <div className="cloud cloud-2" />
        <div className="cloud cloud-3" />

        {/* Plane */}
        <div className="plane-body">✈️</div>

        {/* Runway */}
        <div className="runway" />
      </div>

      <p className="mt-6 text-gray-600 font-medium text-base">{text}</p>
    </div>
  );
}
