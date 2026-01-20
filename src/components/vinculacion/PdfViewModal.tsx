// src/components/vinculacion/PdfViewModal.tsx
import React from "react";

type PdfViewModalProps = {
  open: boolean;
  pdfUrl: string | null | undefined;
  fileName?: string | null;
  onClose: () => void;
  onDownload?: () => void;
};

const PdfViewModal: React.FC<PdfViewModalProps> = ({ open, pdfUrl, fileName, onClose, onDownload }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
        <div className="relative bg-white rounded-md shadow-lg max-w-3xl w-full max-h-[70vh] overflow-auto z-10">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">{fileName ?? "PDF"}</h3>
          <div className="flex items-center gap-2">
            {onDownload && <button onClick={onDownload} className="px-3 py-1 rounded-md border text-sm">Descargar</button>}
            <button onClick={onClose} className="px-3 py-1 rounded-md bg-gray-100 text-sm">Cerrar</button>
          </div>
        </div>

        <div className="p-4 bg-gray-50 flex items-center justify-center">
          {pdfUrl ? (
            <iframe src={pdfUrl} title={fileName ?? "pdf"} className="w-full h-[80vh] border-0" />
          ) : (
            <div className="p-8 text-gray-500">No hay PDF para mostrar.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PdfViewModal;
