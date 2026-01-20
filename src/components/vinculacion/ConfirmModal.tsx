import React from "react";

type Props = {
  open: boolean;
  title: string;
  description?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

const ConfirmModal: React.FC<Props> = ({ open, title, description, onCancel, onConfirm }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6 z-10">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-gray-500 mt-2">{description}</p>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onCancel} className="px-3 py-2 rounded-md border">Cancelar</button>
          <button onClick={onConfirm} className="px-3 py-2 rounded-md bg-red-600 text-white">Eliminar</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
