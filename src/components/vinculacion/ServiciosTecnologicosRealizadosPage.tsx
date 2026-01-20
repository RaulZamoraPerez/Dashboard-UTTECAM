import React, { useEffect, useState } from "react";
import axios from "axios";
import { FileText, Trash2, Plus, X, Upload, Eye } from "lucide-react";
import ConfirmModal from "./ConfirmModal";
import PdfViewModal from "./PdfViewModal";
import { getToken } from "../../services/authService";

interface ServicioRealizado {
  id: number;
  titulo: string;
  archivo: string;
  fecha_realizacion: string;
  orden: number;
  activo: boolean;
}

const BACKEND_URL = import.meta.env.VITE_BACKENDURL || "http://localhost:3004";

const ServiciosTecnologicosRealizadosPage: React.FC = () => {
  const [servicios, setServicios] = useState<ServicioRealizado[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [pdfPreview, setPdfPreview] = useState<{ url: string; name: string } | null>(null);

  // Form states
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newFile, setNewFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchServicios = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await axios.get(`${BACKEND_URL}/api/servicios-tecnologicos-realizados/admin/all`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      setServicios(response.data);
    } catch (err) {
      setToast({ type: "error", message: "Error al cargar los servicios." });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServicios();
  }, []);

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        alert("Solo se permiten archivos PDF.");
        return;
      }
      setNewFile(file);
      if (!newTitle) {
        setNewTitle(file.name.split('.')[0]);
      }
    }
  };

  const handleCreate = async () => {
    if (!newTitle || !newFile) {
        alert("El título y el archivo PDF son obligatorios.");
        return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("titulo", newTitle);
    if (newDate) formData.append("fecha_realizacion", newDate);
    formData.append("archivo", newFile);
    formData.append("activo", "true");

    try {
      const token = getToken();
      await axios.post(`${BACKEND_URL}/api/servicios-tecnologicos-realizados`, formData, {
        headers: { 
            "Authorization": `Bearer ${token}`
        },
      });
      setIsAddModalOpen(false);
      setNewTitle("");
      setNewDate("");
      setNewFile(null);
      setToast({ type: "success", message: "Servicio creado correctamente." });
      fetchServicios();
    } catch (err) {
      console.error("Error creating service:", err);
      setToast({ type: "error", message: "Error al crear el servicio." });
    } finally {
        setIsSubmitting(false);
        setTimeout(() => setToast(null), 2500);
    }
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      const token = getToken();
      await axios.delete(`${BACKEND_URL}/api/servicios-tecnologicos-realizados/${confirmDeleteId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      setConfirmDeleteId(null);
      setToast({ type: "success", message: "Servicio eliminado." });
      fetchServicios();
    } catch (err) {
      console.error("Error deleting service:", err);
      setToast({ type: "error", message: "Error al eliminar el servicio." });
    } finally {
        setTimeout(() => setToast(null), 2500);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-10">
      
      {/* SECCIÓN SERVICIOS */}
      <section>
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-semibold">Servicios Tecnológicos Realizados</h2>
            <p className="text-sm text-gray-500 mt-1">Gestiona los documentos PDF de servicios realizados.</p>
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Plus size={16} />
            Nuevo Servicio
          </button>
        </header>

        <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Cargando servicios...</div>
          ) : servicios.length === 0 ? (
            <div className="p-10 text-center">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="text-gray-400" size={32} />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No hay servicios</h3>
              <p className="text-gray-500 mt-1 mb-6">Sube documentos para que aparezcan en la lista.</p>
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="text-blue-600 hover:underline font-medium"
              >
                Subir el primer servicio
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 font-medium text-gray-700">Documento</th>
                    <th className="px-6 py-3 font-medium text-gray-700">Título</th>
                    <th className="px-6 py-3 font-medium text-gray-700">Fecha Realización</th>
                    <th className="px-6 py-3 font-medium text-gray-700">Archivo</th>
                    <th className="px-6 py-3 font-medium text-gray-700 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {servicios.map((servicio) => (
                    <tr key={servicio.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="w-12 h-12 bg-red-50 rounded flex items-center justify-center text-red-500">
                            <FileText size={24} />
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">{servicio.titulo}</td>
                      <td className="px-6 py-4 text-gray-500">
                        {servicio.fecha_realizacion ? new Date(servicio.fecha_realizacion).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 text-gray-500 truncate max-w-xs">
                        {servicio.archivo.split('/').pop()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => setPdfPreview({ 
                                url: `${BACKEND_URL}/uploads/${servicio.archivo}`, 
                                name: servicio.archivo 
                            })}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Ver PDF"
                          >
                            <Eye size={16} />
                          </button>
                          <button 
                            onClick={() => setConfirmDeleteId(servicio.id)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* MODAL NUEVO SERVICIO */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-5 py-3 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-semibold text-gray-800">Subir Servicio</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Archivo PDF</label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-3 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click para subir</span></p>
                      <p className="text-xs text-gray-500">PDF (MAX. 10MB)</p>
                    </div>
                    <input type="file" className="hidden" accept="application/pdf" onChange={handleFilePick} />
                  </label>
                </div>
                {newFile && (
                  <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                    <FileText size={14} /> {newFile.name}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input 
                  type="text" 
                  value={newTitle} 
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Ej. Servicio de Mantenimiento"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Realización</label>
                <input 
                    type="date" 
                    value={newDate} 
                    onChange={(e) => setNewDate(e.target.value)} 
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
            <div className="px-5 py-3 bg-gray-50 flex justify-end gap-2 border-t">
              <button onClick={() => setIsAddModalOpen(false)} className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200 rounded-md">Cancelar</button>
              <button 
                onClick={handleCreate} 
                disabled={!newFile || isSubmitting}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-md disabled:opacity-50"
              >
                {isSubmitting ? "Subiendo..." : "Subir Servicio"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modales Auxiliares */}
      <PdfViewModal 
        open={!!pdfPreview} 
        pdfUrl={pdfPreview?.url} 
        fileName={pdfPreview?.name} 
        onClose={() => setPdfPreview(null)} 
        onDownload={() => {
            if (pdfPreview?.url) {
                const a = document.createElement('a');
                a.href = pdfPreview.url;
                a.download = pdfPreview.name || 'document.pdf';
                document.body.appendChild(a);
                a.click();
                a.remove();
            }
        }}
      />
      
      <ConfirmModal 
        open={!!confirmDeleteId} 
        title="Eliminar Servicio" 
        description="¿Estás seguro de que deseas eliminar este servicio?" 
        onCancel={() => setConfirmDeleteId(null)} 
        onConfirm={handleDelete} 
      />

      {/* Toast */}
      {toast && (
        <div className="fixed right-4 bottom-6 z-50">
          <div className={`px-4 py-2 rounded-md shadow-md ${toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>{toast.message}</div>
        </div>
      )}
    </div>
  );
};

export default ServiciosTecnologicosRealizadosPage;
