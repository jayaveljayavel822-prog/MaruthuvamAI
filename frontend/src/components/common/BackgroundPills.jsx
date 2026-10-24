import React from 'react';

export default function BackgroundPills() {
  return (
    <div className="pills pointer-events-none fixed inset-0 overflow-hidden z-0">
      <span className="pl c" style={{ top: '7%', left: '5%', '--r': '-30deg' }} />
      <span className="pl r" style={{ top: '14%', right: '9%', animationDelay: '-3s' }} />
      <span className="pl o" style={{ top: '40%', left: '3%', '--r': '20deg', animationDelay: '-5s' }} />
      <span className="pl c v" style={{ top: '62%', right: '5%', '--r': '35deg', animationDelay: '-2s' }} />
      <span className="pl r" style={{ bottom: '12%', left: '12%', animationDelay: '-6s' }} />
      <span className="pl o" style={{ bottom: '7%', right: '20%', '--r': '-20deg', animationDelay: '-4s' }} />
      <span className="pl c" style={{ top: '4%', left: '46%', '--r': '12deg', animationDelay: '-7s' }} />
    </div>
  );
}
