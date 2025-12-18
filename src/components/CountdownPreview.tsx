import React from 'react';

interface CountdownCircleProps {
  label: string;
  value: number;
  max: number;
  color: string;
}

const CountdownCircle: React.FC<CountdownCircleProps> = ({ label, value, max, color }) => {
  const percentage = (value / max) * 100;
  
  const adjustColor = (hex: string, percent: number) => {
    const num = parseInt(hex.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255))
      .toString(16).slice(1);
  };

  const lighterColor = adjustColor(color, 20);
  const darkerColor = adjustColor(color, -20);

  return (
    <div className="w-32 h-32 flex items-center justify-center relative group">
      <svg width="128" height="128" className="relative z-10">
        <circle cx="64" cy="64" r="56" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="none" />
        <defs>
          <linearGradient id={`previewGradient-${label}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={lighterColor} />
            <stop offset="50%" stopColor={color} />
            <stop offset="100%" stopColor={darkerColor} />
          </linearGradient>
        </defs>

        <circle
          cx="64"
          cy="64"
          r="56"
          stroke={`url(#previewGradient-${label})`}
          strokeWidth="8"
          fill="none"
          strokeDasharray={`${Math.PI * 2 * 56}`}
          strokeDashoffset={`${Math.PI * 2 * 56 * (1 - percentage / 100)}`}
          strokeLinecap="round"
          transform="rotate(-90 64 64)"
          style={{ filter: `drop-shadow(0 0 3px ${color}80)` }}
        />

        <text
          x="64"
          y="64"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="28"
          fontWeight="bold"
          fill={color}
          className="drop-shadow-[0_0_2px_rgba(0,0,0,0.8)]"
        >
          {String(value).padStart(2, "0")}
        </text>

        <text
          x="64"
          y="88"
          textAnchor="middle"
          fontSize="11"
          fontWeight="medium"
          fill={darkerColor}
          className="uppercase tracking-wider"
        >
          {label}
        </text>
      </svg>
    </div>
  );
};

interface DecorativeBorderProps {
  color: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

const DecorativeBorder: React.FC<DecorativeBorderProps> = ({ color, position }) => {
  const style: React.CSSProperties = { borderColor: color };
  let className = "absolute w-12 h-12 border-4 ";

  switch (position) {
    case 'top-left':
      className += "top-0 left-0 border-r-0 border-b-0 rounded-tl-lg";
      break;
    case 'top-right':
      className += "top-0 right-0 border-l-0 border-b-0 rounded-tr-lg";
      break;
    case 'bottom-left':
      className += "bottom-0 left-0 border-r-0 border-t-0 rounded-bl-lg";
      break;
    case 'bottom-right':
      className += "bottom-0 right-0 border-l-0 border-t-0 rounded-br-lg";
      break;
  }

  return <div className={className} style={style}></div>;
};

interface CountdownPreviewProps {
  targetDate: string;
  title: string;
  color: string;
  imagen_fondo?: string | File | null;
  texto_boton?: string;
  url_boton?: string;
}

const CountdownPreview: React.FC<CountdownPreviewProps> = ({ 
  targetDate, 
  title, 
  color,
  imagen_fondo,
  texto_boton,
  url_boton
}) => {
  const [timeLeft, setTimeLeft] = React.useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Helper to create object URL for preview
  const getBackgroundUrl = () => {
    if (!imagen_fondo) return null;
    if (typeof imagen_fondo === 'string') return imagen_fondo;
    return URL.createObjectURL(imagen_fondo);
  };

  const backgroundUrl = getBackgroundUrl();

  React.useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date();
      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const adjustColor = (hex: string, percent: number) => {
    // ... (existing color logic)
    const num = parseInt(hex.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255))
      .toString(16).slice(1);
  };

  const lighterColor = adjustColor(color, 20);
  const darkerColor = adjustColor(color, -20);

  return (
    <div className="w-full max-w-4xl mx-auto p-8 rounded-3xl relative overflow-hidden shadow-2xl border border-white/10"
      style={{
        background: backgroundUrl 
          ? `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${backgroundUrl}) center/cover no-repeat`
          : `linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)`
      }}
    >
      {/* Decorative Elements */}
      <DecorativeBorder color={color} position="top-left" />
      <DecorativeBorder color={color} position="top-right" />
      <DecorativeBorder color={color} position="bottom-left" />
      <DecorativeBorder color={color} position="bottom-right" />

      <div className="relative z-10 flex flex-col items-center justify-center space-y-8">
        {/* Badge */}
        <div 
          className="px-6 py-2 rounded-full text-sm font-bold tracking-wider uppercase shadow-lg backdrop-blur-sm border"
          style={{ 
            backgroundColor: `${color}20`, 
            color: color,
            borderColor: `${color}40`
          }}
        >
          Próximo Evento
        </div>

        {/* Title */}
        <h2 className="text-4xl md:text-5xl font-bold text-white text-center tracking-tight drop-shadow-lg">
          {title || 'Título del Evento'}
        </h2>

        {/* Countdown Circles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          <CountdownCircle label="DÍAS" value={timeLeft.days} max={365} color={color} />
          <CountdownCircle label="HORAS" value={timeLeft.hours} max={24} color={color} />
          <CountdownCircle label="MINUTOS" value={timeLeft.minutes} max={60} color={color} />
          <CountdownCircle label="SEGUNDOS" value={timeLeft.seconds} max={60} color={color} />
        </div>

        {/* CTA Button */}
        {texto_boton && (
          <a 
            href={url_boton || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 px-8 py-3 rounded-full font-bold text-white transition-transform hover:scale-105 shadow-lg"
            style={{ 
              background: `linear-gradient(45deg, ${lighterColor}, ${darkerColor})`,
              boxShadow: `0 4px 15px ${color}40`
            }}
          >
            {texto_boton}
          </a>
        )}
      </div>
    </div>
  );
};

export default CountdownPreview;