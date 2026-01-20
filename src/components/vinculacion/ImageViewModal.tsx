import React from "react";

type Props = {
  open: boolean;
  imageUrl: string | null | undefined;
  onClose: () => void;
};

const ImageViewModal: React.FC<Props> = ({ open, imageUrl, onClose }) => {
  if (!open) return null;

  const handleDownload = () => {
    if (!imageUrl) return;
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = "vinculacion-banner";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-white rounded-md shadow-lg max-w-5xl w-full max-h-[90vh] overflow-auto z-10">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Vista completa</h3>
          <div className="flex items-center gap-2">
            <button onClick={handleDownload} className="px-3 py-1 rounded-md border text-sm">Descargar</button>
            <button onClick={onClose} className="px-3 py-1 rounded-md bg-gray-100 text-sm">Cerrar</button>
          </div>
        </div>

        <div className="p-4 flex items-center justify-center bg-gray-50">
          {imageUrl ? (
            <img src={imageUrl} alt="Vista completa" className="max-w-full max-h-[80vh] object-contain" />
          ) : (
            <div className="p-8 text-gray-500">No hay imagen para mostrar.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageViewModal;
