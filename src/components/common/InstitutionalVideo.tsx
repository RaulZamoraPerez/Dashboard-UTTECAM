import { useState } from 'react';

const InstitutionalVideo = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  // Video institucional de UTTECAM (placeholder - reemplazar con URL real)
  const videoUrl = "/uploads/videos/uttecam-institucional.mp4";

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="relative aspect-video bg-gray-900">
        {!isPlaying ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-700">
            <div className="text-center text-white">
              <div className="mb-4">
                <svg className="w-16 h-16 mx-auto opacity-80" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Video Institucional</h3>
              <p className="text-sm opacity-90 mb-4">Universidad Tecnológica de Tecámac</p>
              <button
                onClick={() => setIsPlaying(true)}
                className="bg-white text-blue-600 px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors"
              >
                Ver Video
              </button>
            </div>
          </div>
        ) : (
          <video
            className="w-full h-full object-cover"
            controls
            autoPlay
            onEnded={() => setIsPlaying(false)}
          >
            <source src={videoUrl} type="video/mp4" />
            <p className="text-white text-center p-4">
              Tu navegador no soporta el elemento de video.
              <br />
              <a href={videoUrl} className="text-blue-400 underline">
                Descargar video
              </a>
            </p>
          </video>
        )}
      </div>
      <div className="p-4">
        <h4 className="font-semibold text-gray-800 mb-2">UTTECAM - Nuestra Institución</h4>
        <p className="text-sm text-gray-600">
          Conoce más sobre la Universidad Tecnológica de Tecámac, nuestra misión, visión y los programas académicos que ofrecemos.
        </p>
      </div>
    </div>
  );
};

export default InstitutionalVideo;