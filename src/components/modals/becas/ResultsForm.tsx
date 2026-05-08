import React, { useState, useRef } from 'react';
import { Plus, Trash2, FileText, CheckCircle, List, Info, AlertTriangle, Upload, Loader2, Layout } from 'lucide-react';
import becasService from '../../../services/becasService';
import { toastError, toastSuccess } from '../../../utils/alert';

export interface ResultsData {
    badge?: string;
    mainTitle?: string;
    title: string;
    description?: string;
    beneficiadosText?: string;
    beneficiadosCard?: {
        title: string;
        content: string;
        note?: string;
    };
    documents?: { title: string; subtitle: string; url: string }[];
    indicacionesBeneficiados?: string[];
    indicacionesNoBeneficiados?: string[];
    infobox?: string;
    importantNote?: string;
}

interface ResultsFormProps {
    initialData: ResultsData;
    onChange: (data: ResultsData) => void;
}

export const ResultsForm = ({ initialData, onChange }: ResultsFormProps) => {
    const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpdate = (field: keyof ResultsData, value: any) => {
        onChange({ ...initialData, [field]: value });
    };

    const handleBeneficiadosCardUpdate = (field: string, value: string) => {
        onChange({
            ...initialData,
            beneficiadosCard: {
                title: 'Beneficiados',
                content: '',
                ...initialData.beneficiadosCard,
                [field]: value
            }
        });
    };

    const addListElement = (field: 'indicacionesBeneficiados' | 'indicacionesNoBeneficiados') => {
        const newList = [...(initialData[field] || []), ''];
        handleUpdate(field, newList);
    };

    const removeListElement = (field: 'indicacionesBeneficiados' | 'indicacionesNoBeneficiados', index: number) => {
        const newList = (initialData[field] || []).filter((_, i) => i !== index);
        handleUpdate(field, newList);
    };

    const updateListElement = (field: 'indicacionesBeneficiados' | 'indicacionesNoBeneficiados', index: number, value: string) => {
        const newList = [...(initialData[field] || [])];
        newList[index] = value;
        handleUpdate(field, newList);
    };

    const addDocument = () => {
        const newDocs = [...(initialData.documents || []), { title: 'Nuevo Listado', subtitle: 'PDF', url: '' }];
        handleUpdate('documents', newDocs);
    };

    const removeDocument = (index: number) => {
        const newDocs = (initialData.documents || []).filter((_, i) => i !== index);
        handleUpdate('documents', newDocs);
    };

    const updateDocument = (index: number, field: string, value: string) => {
        const newDocs = [...(initialData.documents || [])];
        newDocs[index] = { ...newDocs[index], [field]: value };
        handleUpdate('documents', newDocs);
    };

    const handleFileUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploadingIdx(index);
            const response = await becasService.uploadBannerFile(file);
            updateDocument(index, 'url', response.url);
            toastSuccess('Archivo subido correctamente');
        } catch (error) {
            console.error('Error uploading file:', error);
            toastError('Error al subir el archivo');
        } finally {
            setUploadingIdx(null);
            if (e.target) e.target.value = '';
        }
    };

    const handleLoadStructure = () => {
        const structure: ResultsData = {
            ...initialData,
            mainTitle: 'RESULTADOS DE LA CONVOCATORIA DE BECAS',
            beneficiadosText: 'Se informa a la comunidad universitaria que los resultados de la convocatoria de becas ya se encuentran disponibles para su consulta.',
            beneficiadosCard: {
                title: 'Beneficiados',
                content: 'Listado oficial de estudiantes aceptados para el ciclo escolar vigente.',
                note: 'Beca de Manutención'
            },
            documents: [
                { title: 'Lista de Beneficiados 2026', subtitle: 'PDF', url: '' }
            ],
            indicacionesBeneficiados: [
                'Ubica tu número de folio en el listado oficial.',
                'Acude a la oficina de becas con tu credencial vigente.',
                'Firma la carta de aceptación y compromiso.'
            ],
            indicacionesNoBeneficiados: [
                'Revisa el motivo de rechazo en tu portal de alumno.',
                'Mantente atento a la próxima convocatoria del siguiente cuatrimestre.'
            ],
            infobox: 'Para mayores informes, favor de comunicarse al Departamento de Becas o enviar un correo a: becas@uttecam.edu.mx en horario de 9:00 a 16:00 hrs.',
            importantNote: 'El cumplimiento de los trámites en las fechas establecidas es de carácter obligatorio para conservar el beneficio de la beca.'
        };
        onChange(structure);
        toastSuccess('Estructura sugerida cargada');
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Botón de Estructura Rápida */}
            <div className="flex justify-end">
                <button
                    onClick={handleLoadStructure}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md transition-all active:scale-95"
                >
                    <Layout size={18} />
                    Generar Estructura Sugerida
                </button>
            </div>

            {/* Cabecera Principal */}
            <div className="bg-gray-50 dark:bg-gray-900/40 p-6 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Info size={20} className="text-blue-500" />
                    Cabecera de Resultados
                </h3>
                
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Título de Periodo (Superior)</label>
                    <input
                        type="text"
                        value={initialData.mainTitle || ''}
                        onChange={(e) => handleUpdate('mainTitle', e.target.value)}
                        placeholder="Ej: ESTADÍA PROFESIONAL: MAYO - AGOSTO 2026"
                        className="w-full p-2 bg-white dark:bg-gray-800 border rounded-lg focus:ring-2 focus:ring-[#0a9782] outline-none"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Badge (Etiqueta)</label>
                        <input
                            type="text"
                            value={initialData.badge}
                            onChange={(e) => handleUpdate('badge', e.target.value)}
                            placeholder="Ej: RESULTADOS"
                            className="w-full p-2 bg-white dark:bg-gray-800 border rounded-lg focus:ring-2 focus:ring-[#0a9782] outline-none"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Título de la Sección</label>
                        <input
                            type="text"
                            value={initialData.title}
                            onChange={(e) => handleUpdate('title', e.target.value)}
                            className="w-full p-2 bg-white dark:bg-gray-800 border rounded-lg focus:ring-2 focus:ring-[#0a9782] outline-none font-bold"
                        />
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Descripción Breve</label>
                    <textarea
                        value={initialData.description}
                        onChange={(e) => handleUpdate('description', e.target.value)}
                        className="w-full p-2 bg-white dark:bg-gray-800 border rounded-lg focus:ring-2 focus:ring-[#0a9782] outline-none min-h-[80px]"
                        placeholder="Mensaje introductorio para los estudiantes..."
                    />
                </div>
            </div>

            {/* Beneficiados High-Impact Card */}
            <div className="bg-green-50 dark:bg-green-900/10 p-6 rounded-xl border border-green-200 dark:border-green-800/40 space-y-4">
                <h3 className="text-lg font-bold text-green-800 dark:text-green-300 flex items-center gap-2">
                    <CheckCircle size={20} />
                    Tarjeta de Beneficiados
                </h3>
                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-green-700/70 dark:text-green-400 uppercase tracking-wider">Texto Principal de Información</label>
                        <textarea
                            value={initialData.beneficiadosText}
                            onChange={(e) => handleUpdate('beneficiadosText', e.target.value)}
                            className="w-full p-2 bg-white dark:bg-gray-800 border border-green-200 dark:border-green-800/60 rounded-lg outline-none min-h-[100px]"
                            placeholder="Informa a la comunidad sobre los resultados..."
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-green-700/70 dark:text-green-400 uppercase tracking-wider">Título de Tarjeta</label>
                            <input
                                type="text"
                                value={initialData.beneficiadosCard?.title || 'Beneficiados'}
                                onChange={(e) => handleBeneficiadosCardUpdate('title', e.target.value)}
                                className="w-full p-2 bg-white dark:bg-gray-800 border border-green-200 dark:border-green-800/60 rounded-lg outline-none"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-green-700/70 dark:text-green-400 uppercase tracking-wider">Nota al Pie de Tarjeta</label>
                            <input
                                type="text"
                                value={initialData.beneficiadosCard?.note || ''}
                                onChange={(e) => handleBeneficiadosCardUpdate('note', e.target.value)}
                                placeholder="Ej: Esta beca cubre el 100% de la cuota..."
                                className="w-full p-2 bg-white dark:bg-gray-800 border border-green-200 dark:border-green-800/60 rounded-lg outline-none"
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-green-700/70 dark:text-green-400 uppercase tracking-wider">Contenido de Tarjeta (Resumen)</label>
                        <textarea
                            value={initialData.beneficiadosCard?.content || ''}
                            onChange={(e) => handleBeneficiadosCardUpdate('content', e.target.value)}
                            className="w-full p-2 bg-white dark:bg-gray-800 border border-green-200 dark:border-green-800/60 rounded-lg outline-none min-h-[80px]"
                            placeholder="Detalla quiénes son los beneficiados..."
                        />
                    </div>
                </div>
            </div>

            {/* Listados de Documentos */}
            <div className="bg-gray-50 dark:bg-gray-900/40 p-6 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <FileText size={20} className="text-red-500" />
                        Listados de Resultados (Descargas)
                    </h3>
                    <button
                        onClick={addDocument}
                        className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow-sm flex items-center gap-2 text-sm px-4"
                    >
                        <Plus size={16} /> Agregar Archivo
                    </button>
                </div>
                
                <div className="space-y-3">
                    {initialData.documents?.map((doc, idx) => (
                        <div key={idx} className="flex flex-col gap-3 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700 group relative">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-bold text-gray-400 uppercase">Documento #{idx + 1}</span>
                                <button
                                    onClick={() => removeDocument(idx)}
                                    className="p-1 text-red-400 hover:text-red-600 transition"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Título</label>
                                    <input
                                        type="text"
                                        value={doc.title}
                                        onChange={(e) => updateDocument(idx, 'title', e.target.value)}
                                        placeholder="Título del documento"
                                        className="w-full p-2 border rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#0a9782]"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Subtítulo</label>
                                    <input
                                        type="text"
                                        value={doc.subtitle}
                                        onChange={(e) => updateDocument(idx, 'subtitle', e.target.value)}
                                        placeholder="Subtítulo (Ej: PDF)"
                                        className="w-full p-2 border rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#0a9782]"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">URL o Archivo</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={doc.url}
                                        onChange={(e) => updateDocument(idx, 'url', e.target.value)}
                                        placeholder="URL o Ruta del archivo"
                                        className="flex-1 p-2 border rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#0a9782]"
                                    />
                                    <label className="flex-shrink-0">
                                        <input
                                            type="file"
                                            className="hidden"
                                            onChange={(e) => handleFileUpload(idx, e)}
                                            accept=".pdf,.doc,.docx,.xls,.xlsx"
                                        />
                                        <div className={`cursor-pointer p-2 rounded-lg flex items-center gap-2 text-sm font-bold transition-all ${
                                            uploadingIdx === idx 
                                            ? 'bg-gray-100 text-gray-400' 
                                            : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200'
                                        }`}>
                                            {uploadingIdx === idx ? (
                                                <Loader2 size={18} className="animate-spin" />
                                            ) : (
                                                <Upload size={18} />
                                            )}
                                            Subir
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Indicaciones Listas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Beneficiados */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <List size={18} className="text-green-500" />
                            Pasos Beneficiados
                        </h4>
                        <button onClick={() => addListElement('indicacionesBeneficiados')} className="text-green-600 hover:text-green-700 text-xs font-bold uppercase tracking-widest">+ Agregar</button>
                    </div>
                    <div className="space-y-2">
                        {initialData.indicacionesBeneficiados?.map((item, idx) => (
                            <div key={idx} className="flex gap-2">
                                <input
                                    type="text"
                                    value={item}
                                    onChange={(e) => updateListElement('indicacionesBeneficiados', idx, e.target.value)}
                                    className="flex-1 p-2 bg-white dark:bg-gray-800 border rounded-lg text-sm"
                                />
                                <button onClick={() => removeListElement('indicacionesBeneficiados', idx)} className="text-gray-400 hover:text-red-500 transition"><Trash2 size={16} /></button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* No Beneficiados */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <List size={18} className="text-amber-500" />
                            Pasos No Beneficiados
                        </h4>
                        <button onClick={() => addListElement('indicacionesNoBeneficiados')} className="text-amber-600 hover:text-amber-700 text-xs font-bold uppercase tracking-widest">+ Agregar</button>
                    </div>
                    <div className="space-y-2">
                        {initialData.indicacionesNoBeneficiados?.map((item, idx) => (
                            <div key={idx} className="flex gap-2">
                                <input
                                    type="text"
                                    value={item}
                                    onChange={(e) => updateListElement('indicacionesNoBeneficiados', idx, e.target.value)}
                                    className="flex-1 p-2 bg-white dark:bg-gray-800 border rounded-lg text-sm"
                                />
                                <button onClick={() => removeListElement('indicacionesNoBeneficiados', idx)} className="text-gray-400 hover:text-red-500 transition"><Trash2 size={16} /></button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Avisos Inferiores */}
            <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-xl border border-blue-200 dark:border-blue-800/40 space-y-4">
                <h3 className="text-lg font-bold text-blue-800 dark:text-blue-300 flex items-center gap-2">
                    <AlertTriangle size={20} />
                    Avisos y Contacto
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-blue-700/70 dark:text-blue-400 uppercase tracking-wider">Cuadro de Información (Infobox)</label>
                        <textarea
                            value={initialData.infobox}
                            onChange={(e) => handleUpdate('infobox', e.target.value)}
                            className="w-full p-2 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-800/60 rounded-lg outline-none min-h-[80px]"
                            placeholder="Ej: Para mayores informes, favor de comunicarse..."
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-red-700/70 dark:text-red-400 uppercase tracking-wider">Aviso Importante (Rojo)</label>
                        <textarea
                            value={initialData.importantNote}
                            onChange={(e) => handleUpdate('importantNote', e.target.value)}
                            className="w-full p-2 bg-white dark:bg-gray-800 border border-red-100 dark:border-red-800/60 rounded-lg outline-none min-h-[80px]"
                            placeholder="Ej: El cumplimiento de estos requisitos es obligatorio..."
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
