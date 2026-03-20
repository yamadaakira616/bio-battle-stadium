import { useEffect, useState } from 'react';
const COLORS = ['#f97316','#eab308','#22c55e','#3b82f6','#a855f7','#ec4899','#06b6d4'];
export default function Confetti({ active }) {
  const [ps, setPs] = useState([]);
  useEffect(() => {
    if (!active) { setPs([]); return; }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setPs([]); return; }
    setPs(Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: COLORS[i % COLORS.length],
      delay: Math.random() * 0.6,
      dur: 1.2 + Math.random() * 0.8,
      size: 7 + Math.random() * 9,
      rotate: Math.random() * 360,
      circle: Math.random() > 0.5,
    })));
  }, [active]);
  if (!ps.length) return null;
  return (
    <div aria-hidden="true" style={{ position:'fixed', inset:0, pointerEvents:'none', overflow:'hidden', zIndex:100 }}>
      {ps.map(p => (
        <div key={p.id} style={{
          position:'absolute', left:`${p.x}%`, top:'-30px',
          width:p.size, height:p.size,
          backgroundColor:p.color,
          borderRadius: p.circle ? '50%' : '2px',
          transform:`rotate(${p.rotate}deg)`,
          animation:`confettiFall ${p.dur}s ${p.delay}s ease-in forwards`,
        }}/>
      ))}
    </div>
  );
}
