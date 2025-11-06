import { useState, useEffect } from 'react';

const DigitalClock = () => {
  const [time, setTime] = useState(new Date());
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (isActive) {
      const timer = setInterval(() => {
        setTime(new Date());
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isActive]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-MX', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const toggleClock = () => {
    setIsActive(!isActive);
  };

  return (
    <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg p-6 text-white shadow-lg">
      <div className="text-center">
        <div className="text-4xl font-mono font-bold mb-2">
          {isActive ? formatTime(time) : '--:--:--'}
        </div>
        <div className="text-lg opacity-90 capitalize mb-4">
          {isActive ? formatDate(time) : 'Reloj desactivado'}
        </div>
        <button
          onClick={toggleClock}
          className="bg-white text-blue-600 px-4 py-2 rounded-md font-semibold hover:bg-gray-100 transition-colors"
        >
          {isActive ? 'Desactivar Reloj' : 'Activar Reloj'}
        </button>
      </div>
    </div>
  );
};

export default DigitalClock;