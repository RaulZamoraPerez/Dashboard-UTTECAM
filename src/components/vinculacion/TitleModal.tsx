// src/components/vinculacion/TitleModal.tsx
import React, { useState, useEffect } from "react";

type TitleModalProps = {
  open: boolean;
  defaultTitle?: string;
  onConfirm: (title: string) => void;
  onCancel: () => void;
};

const TitleModal: React.FC<TitleModalProps> = ({ open, defaultTitle = "", onConfirm, onCancel }) => {
  const [title, setTitle] = useState<string>(defaultTitle);

  useEffect(() => {
    setTitle(defaultTitle);
  }, [defaultTitle]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6 z-10">
        <h3 className="text-lg font-semibold">Título de la imagen</h3>
        <p className="text-sm text-gray-500 mt-1">Introduce un título para la imagen que acabas de subir.</p>

        <div className="mt-4">
          <input type="text" className="w-full border rounded-md px-3 py-2" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej. Foto: Servicio X" />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onCancel} className="px-3 py-2 rounded-md border">Cancelar</button>
          <button onClick={() => onConfirm(title)} className="px-3 py-2 rounded-md bg-blue-600 text-white">Confirmar</button>
        </div>
      </div>
    </div>
  );
};

export default TitleModal;
