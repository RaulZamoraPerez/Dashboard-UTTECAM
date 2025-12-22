import { useState, useEffect } from 'react';
import { Plus, Trash2, Image as ImageIcon, Upload, Sparkles, FileText, ArrowUp, ArrowDown } from 'lucide-react';
import becasService from '../../../services/becasService';

export interface BannerData {
    title: string;
    subtitle: string;
    description: string;
    imageUrl: string;
    footerNote: string;
    buttons: { text: string; url: string; type: 'primary' | 'secondary'; icon: 'download' | 'eye' }[];
}

interface BannerFormProps {
    initialData: BannerData;
    onChange: (data: BannerData) => void;
}

export const BannerForm = ({ initialData, onChange }: BannerFormProps) => {
    const [title, setTitle] = useState(initialData.title || '');
    const [subtitle, setSubtitle] = useState(initialData.subtitle || '');
    const [description, setDescription] = useState(initialData.description || '');
    const [imageUrl, setImageUrl] = useState(initialData.imageUrl || '');
    const [footerNote, setFooterNote] = useState(initialData.footerNote || '');
    const [buttons, setButtons] = useState(initialData.buttons || []);
    const [uploading, setUploading] = useState(false);
    const [uploadingPdf, setUploadingPdf] = useState(false);

    // Sync internal state with prop changes
    useEffect(() => {
        setTitle(initialData.title || '');
        setSubtitle(initialData.subtitle || '');
        setDescription(initialData.description || '');
        setImageUrl(initialData.imageUrl || '');
        setFooterNote(initialData.footerNote || '');
        setButtons(initialData.buttons || []);
    }, [initialData]);

    // Notificar cambios al padre cuando cualquier estado cambie
    useEffect(() => {
        onChange({
            title,
            subtitle,
            description,
            imageUrl,
            footerNote,
            buttons
        });
    }, [title, subtitle, description, imageUrl, footerNote, buttons]);

    const addButton = () => {
        setButtons([...buttons, { text: 'Nuevo Botón', url: '#', type: 'primary', icon: 'eye' }]);
    };

    const removeButton = (index: number) => {
        setButtons(buttons.filter((_, i) => i !== index));
    };

    const moveButton = (index: number, direction: 'up' | 'down') => {
        const newButtons = [...buttons];
        if (direction === 'up' && index > 0) {
            [newButtons[index], newButtons[index - 1]] = [newButtons[index - 1], newButtons[index]];
        } else if (direction === 'down' && index < newButtons.length - 1) {
            [newButtons[index], newButtons[index + 1]] = [newButtons[index + 1], newButtons[index]];
        }
        setButtons(newButtons);
    };

    const updateButton = (index: number, field: string, value: any) => {
        const newButtons = [...buttons];
        newButtons[index] = { ...newButtons[index], [field]: value };
        setButtons(newButtons);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            // Usamos uploadBannerFile que vale para ambos, o el específico de image si preferimos
            // El backend ahora tiene /upload-file general
            const response = await becasService.uploadBannerFile(file);
            const fullUrl = response.url.startsWith('http') ? response.url : `${import.meta.env.VITE_API_URL || 'http://localhost:3002'}${response.url}`;
            setImageUrl(fullUrl);

            // Actualizar botón "Ver Cartel" con esta imagen
            updateButtonUrlIfExists('Ver Cartel', fullUrl);
        } catch (error) {
            console.error('Error al subir imagen:', error);
            alert('Error al subir la imagen');
        } finally {
            setUploading(false);
        }
    };

    const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            alert('Por favor sube un archivo PDF válido');
            return;
        }

        try {
            setUploadingPdf(true);
            const response = await becasService.uploadBannerFile(file);
            const fullUrl = response.url.startsWith('http') ? response.url : `${import.meta.env.VITE_API_URL || 'http://localhost:3002'}${response.url}`;

            // Actualizar o crear botón "Descargar PDF"
            updateButtonUrlIfExists('Descargar PDF', fullUrl, true);
        } catch (error) {
            console.error('Error al subir PDF:', error);
            alert('Error al subir el PDF');
        } finally {
            setUploadingPdf(false);
        }
    };

    // Helper para actualizar URL de botón existente o crear si flag activo
    const updateButtonUrlIfExists = (btnText: string, newUrl: string, createIfMissing = false) => {
        const idx = buttons.findIndex(b => b.text.toLowerCase().includes(btnText.toLowerCase()));

        if (idx >= 0) {
            updateButton(idx, 'url', newUrl);
        } else if (createIfMissing) {
            setButtons(prev => [...prev, {
                text: btnText,
                url: newUrl,
                type: 'primary',
                icon: 'download'
            }]);
        }
    };

    const handleLoadExample = () => {
        if (confirm('¿Cargar plantilla de ejemplo? Esto reemplazará los datos actuales.')) {
            setTitle('Beca de Exención de Pago\nEnero - Abril 2026');
            setSubtitle('CONVOCATORIA ABIERTA');
            setDescription('Convocatoria oficial para el proceso de selección de becas del periodo Enero - Abril 2026.');
            setFooterNote('Lectura obligatoria para todos los solicitantes.');
            setButtons([
                { text: 'Descargar PDF', url: '#', type: 'primary', icon: 'download' },
                { text: 'Ver Cartel', url: '#', type: 'secondary', icon: 'eye' }
            ]);
            // No seteamos imagen para que suban la suya, o podríamos poner una placeholder si tuviéramos
        }
    };

    const handleButtonFileUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            console.log('Botón index:', index, 'Archivo seleccionado:', file.name);
            setUploading(true);
            const response = await becasService.uploadBannerFile(file);
            console.log('Respuesta del servidor:', response);

            const fullUrl = response.url.startsWith('http') ? response.url : `${import.meta.env.VITE_API_URL || 'http://localhost:3002'}${response.url}`;
            console.log('URL construida:', fullUrl);

            // ATOMIC UPDATE: Modify copy and set state ONCE to avoid race conditions
            setButtons(prevButtons => {
                const newButtons = [...prevButtons];
                const updatedButton = { ...newButtons[index], url: fullUrl };

                // Auto-detectar icono según tipo
                if (file.type === 'application/pdf') {
                    updatedButton.icon = 'download';
                } else if (file.type.startsWith('image/')) {
                    updatedButton.icon = 'eye';
                }

                newButtons[index] = updatedButton;
                return newButtons;
            });
            console.log('Estado de botones actualizados atómicamente');

        } catch (error) {
            console.error('Error al subir archivo para botón:', error);
            alert('Error al subir el archivo');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Título Principal */}
            {/* Título Principal y Botón Mágico */}
            <div className="flex justify-between items-end gap-4">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título Principal</label>
                    <textarea
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        rows={2}
                        className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
                        placeholder="Ej: Beca de Exención de Pago"
                    />
                </div>
                <button
                    onClick={handleLoadExample}
                    className="p-2 mb-0.5 text-pink-600 bg-pink-50 hover:bg-pink-100 rounded-lg border border-pink-200 transition flex items-center gap-2 text-sm font-medium"
                    title="Cargar ejemplo de Beca"
                >
                    <Sparkles size={18} />
                    Cargar Ejemplo
                </button>
            </div>

            {/* Subtítulo (Badge) */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subtítulo / Etiqueta</label>
                <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Ej: CONVOCATORIA ABIERTA"
                />
            </div>

            {/* Descripción */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Descripción detallada..."
                />
            </div>

            {/* URL Imagen */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL de Imagen</label>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <ImageIcon className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input
                            type="text"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            className="w-full pl-10 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="https://..."
                        />
                    </div>
                    <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg cursor-pointer transition">
                        <Upload size={18} className="text-gray-600 dark:text-gray-300" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {uploading ? 'Subiendo...' : 'Subir'}
                        </span>
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageUpload}
                            disabled={uploading}
                        />
                    </label>
                </div>
                {imageUrl && (
                    <div className="mt-2 h-32 w-full bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden">
                        <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                )}
            </div>

            {/* Subir PDF (Convocatoria) */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Documento de Convocatoria (PDF)</label>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <FileText className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input
                            type="text"
                            readOnly
                            value={buttons.find(b => b.text.includes('PDF'))?.url || ''}
                            className="w-full pl-10 p-2 border rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-500"
                            placeholder="Sube un PDF para generar el enlace..."
                        />
                    </div>
                    <label className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg cursor-pointer transition border border-red-100 dark:border-red-900">
                        <Upload size={18} className="text-red-600 dark:text-red-400" />
                        <span className="text-sm font-medium text-red-700 dark:text-red-300">
                            {uploadingPdf ? 'Subiendo...' : 'Subir PDF'}
                        </span>
                        <input
                            type="file"
                            accept="application/pdf"
                            className="hidden"
                            onChange={handlePdfUpload}
                            disabled={uploadingPdf}
                        />
                    </label>
                </div>
                <p className="text-xs text-gray-500 mt-1">Al subir un PDF, se actualizará o creará automáticamente el botón "Descargar PDF".</p>
            </div>

            {/* Botones */}
            <div>
                <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Botones de Acción</label>
                    <button
                        onClick={addButton}
                        className="text-sm text-[#0a9782] hover:underline flex items-center gap-1"
                    >
                        <Plus size={16} /> Agregar Botón
                    </button>
                </div>

                <div className="space-y-3">
                    {buttons.map((btn, idx) => (
                        <div key={idx} className="flex gap-2 items-start bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                            {/* Flechas de ordenamiento */}
                            <div className="flex flex-col gap-1 pt-1">
                                <button
                                    onClick={() => moveButton(idx, 'up')}
                                    disabled={idx === 0}
                                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                                    title="Mover arriba"
                                >
                                    <ArrowUp size={16} />
                                </button>
                                <button
                                    onClick={() => moveButton(idx, 'down')}
                                    disabled={idx === buttons.length - 1}
                                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                                    title="Mover abajo"
                                >
                                    <ArrowDown size={16} />
                                </button>
                            </div>

                            <div className="flex-1 space-y-2">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={btn.text}
                                        onChange={(e) => updateButton(idx, 'text', e.target.value)}
                                        className="flex-1 p-2 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder="Texto del botón"
                                    />
                                    <select
                                        value={btn.type}
                                        onChange={(e) => updateButton(idx, 'type', e.target.value)}
                                        className="p-2 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    >
                                        <option value="primary">Primario (Azul)</option>
                                        <option value="secondary">Secundario (Blanco)</option>
                                        <option value="outline">Bordeado</option>
                                    </select>
                                </div>
                                <div className="flex gap-2">
                                    <div className="flex-1 flex gap-1">
                                        <input
                                            type="text"
                                            value={btn.url}
                                            onChange={(e) => updateButton(idx, 'url', e.target.value)}
                                            className="flex-1 p-2 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            placeholder="URL de destino"
                                        />
                                        <label
                                            className="p-2 border rounded dark:border-gray-600 cursor-pointer bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition"
                                            title="Subir archivo para este botón"
                                        >
                                            <Upload size={18} className="text-gray-500 dark:text-gray-300" />
                                            <input
                                                type="file"
                                                className="hidden"
                                                onChange={(e) => handleButtonFileUpload(idx, e)}
                                                disabled={uploading}
                                            />
                                        </label>
                                    </div>
                                    <select
                                        value={btn.icon}
                                        onChange={(e) => updateButton(idx, 'icon', e.target.value)}
                                        className="p-2 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    >
                                        <option value="eye">Icono Ver</option>
                                        <option value="download">Icono Descargar</option>
                                        <option value="link">Icono Enlace</option>
                                        <option value="calendar">Icono Calendario</option>
                                    </select>
                                </div>
                            </div>
                            <button
                                onClick={() => removeButton(idx)}
                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Nota al pie */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nota al pie (Opcional)</label>
                <input
                    type="text"
                    value={footerNote}
                    onChange={(e) => setFooterNote(e.target.value)}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Ej: Lectura obligatoria..."
                />
            </div>
        </div>
    );
};
