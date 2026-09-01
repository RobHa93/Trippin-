import React from 'react';

// Angles (in degrees) the little hearts fly outward at, staggered slightly
// so the burst doesn't look perfectly mechanical.
const PARTICLES = [
  { angle: -70, delay: 0 },
  { angle: -25, delay: 60 },
  { angle: 15, delay: 20 },
  { angle: 55, delay: 80 },
  { angle: 100, delay: 40 },
  { angle: 145, delay: 100 },
];

/**
 * Short-lived heart-pop + particle burst shown over the save button when a
 * trip is saved. Purely decorative — renders nothing while `active` is false.
 */
export default function HeartBurst({ active }) {
  if (!active) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <span className="text-2xl heart-burst-pop">❤️</span>
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className="absolute text-sm heart-burst-particle"
          style={{ '--angle': `${p.angle}deg`, animationDelay: `${p.delay}ms` }}
        >
          ❤️
        </span>
      ))}
    </div>
  );
}
