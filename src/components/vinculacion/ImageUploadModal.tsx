import React, { useEffect, useRef, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onFileSelected: (file: File | null, previewUrl?: string | null) => void;
};

const ImageUploadModal: React.FC<Props> = ({ open, onClose, onFileSelected }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) {
      setFile(null);
      setPreview(null);
    }
  }, [open]);

  const handlePickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      alert("Sólo se permiten imágenes (JPG/PNG).");
      return;
    }

    setFile(f);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
    // reset input value to allow same file reselect
    e.currentTarget.value = "";
  };

  const handleConfirm = () => {
    if (!file || !preview) return alert("Selecciona primero una imagen.");
    onFileSelected(file, preview);
  };

  const handleClear = () => {
    setFile(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-xl w-full p-6 z-10">
        <h3 className="text-lg font-semibold">Subir imagen</h3>
        <p className="text-sm text-gray-500 mt-1">Solo archivos de imagen (JPG/PNG).</p>

        <div className="mt-4">
          <input ref={inputRef} type="file" accept="image/*" onChange={handlePickFile} />
        </div>

        <div className="mt-4">
          <div className="border rounded-md overflow-hidden">
            {preview ? (
              <img src={preview} alt="preview" className="object-cover w-full h-48" />
            ) : (
              <div className="p-6 text-center text-gray-400">Selecciona una imagen para previsualizar</div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={handleClear} className="px-3 py-2 rounded-md border">Limpiar</button>
          <button onClick={onClose} className="px-3 py-2 rounded-md border">Cancelar</button>
          <button onClick={handleConfirm} className="px-3 py-2 rounded-md bg-blue-600 text-white" disabled={!file}>Confirmar</button>
        </div>
      </div>
    </div>
  );
};

export default ImageUploadModal;
