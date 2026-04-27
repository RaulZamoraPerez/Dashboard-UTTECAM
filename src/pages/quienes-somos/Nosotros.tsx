import React, { useState } from 'react';
import { useNosotros } from '../../hooks/useNosotros';
import { getImageUrl } from '../../services/nosotrosService';
import RichTextEditor from '../../components/ui/RichTextEditor';
import { 
  Eye, 
  Target, 
  Heart, 
  FileText, 
  Flag, 
  Edit2, 
  Save, 
  X, 
  Users,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import Swal from 'sweetalert2';

// ─── Helpers de validación ──────────────────────────────────────────────────

/** Quita todas las etiquetas HTML y espacios/nbsp para obtener el texto real */
const stripHtml = (html: string): string =>
  html
    .replace(/<[^>]*>/g, '')          // quita tags
    .replace(/&nbsp;/gi, ' ')         // nbsp → espacio
    .replace(/&[a-z]+;/gi, ' ')       // otras entidades HTML
    .trim();

/** Verifica si el contenido (HTML o texto) es efectivamente vacío */
const isEffectivelyEmpty = (value: string): boolean => {
  if (!value) return true;
  const stripped = stripHtml(value);
  return stripped === '';
};

/** Etiquetas amigables para los mensajes de error */
const SECTION_LABELS: Record<string, string> = {
  vision:            'Visión',
  mision:            'Misión',
  valores:           'Valores',
  politicaIntegral:  'Política Integral',
  objetivoIntegral:  'Objetivo Integral',
  noDiscriminacion:  'Política de Igualdad',
};

// ─────────────────────────────────────────────────────────────────────────────
// LÍMITES DE CARACTERES por sección
// BD: objetivoIntegral = TEXT (65 535 bytes), resto = JSON (sin límite de columna).
// Se aplican límites de UX genérosos pero sensatos para textos institucionales.
// ─────────────────────────────────────────────────────────────────────────────
const CHAR_LIMITS: Record<string, number> = {
  vision:           3_000,   // JSON.description
  mision:           3_000,   // JSON.description
  politicaIntegral: 5_000,   // JSON.text
  objetivoIntegral: 5_000,   // TEXT (65 535 bytes duro, limité UX a 5 000)
  noDiscriminacion: 2_000,   // JSON.text (descripción de la sección)
};

// Límite de ítems para listas
const ITEM_LIMITS: Record<string, number> = {
  valores:           30,   // array de strings → sin columna propia
  noDiscriminacion:  40,   // items de la política
};
// ─────────────────────────────────────────────────────────────────────────────
const SECTIONS_CONFIG: Record<string, { title: string, icon: React.ElementType, description: string }> = {
  vision: { title: 'Visión', icon: Eye, description: 'La aspiración futura de la institución.' },
  mision: { title: 'Misión', icon: Target, description: 'El propósito fundamental y razón de ser.' },
  valores: { title: 'Valores', icon: Heart, description: 'Principios éticos y culturales.' },
  politicaIntegral: { title: 'Política Integral', icon: FileText, description: 'Compromisos y directrices generales.' },
  objetivoIntegral: { title: 'Objetivo Integral', icon: Flag, description: 'Metas globales de la organización.' },
  noDiscriminacion: { title: 'Política de Igualdad', icon: Users, description: 'Igualdad, No Discriminación y Derechos Humanos.' },
};

export default function NosotrosPage() {
  const { content, loading, error, updateSection, updateAllContent, uploadImage, refetch } = useNosotros();
  
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [editText, setEditText] = useState<string>(''); // For secondary text fields
  const [editFile, setEditFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Handle opening the edit modal
  const handleEdit = (section: string) => {
    setEditingSection(section);
    setEditFile(null);
    setPreviewUrl(null);
    setEditText('');

    if (!content) return;

    let initialValue = '';
    if (section === 'vision') initialValue = content.vision?.description || '';
    else if (section === 'mision') initialValue = content.mision?.description || '';
    else if (section === 'valores') initialValue = Array.isArray(content.valores?.description) ? content.valores.description.join('\n') : '';
    else if (section === 'noDiscriminacion') {
      initialValue = content.noDiscriminacion?.items ? content.noDiscriminacion.items.join('\n') : '';
      setEditText((content.noDiscriminacion as any)?.text || '');
    }
    else if (section === 'politicaIntegral') {
      initialValue = content.politicaIntegral?.text || '';
      if (content.politicaIntegral?.imageSrc) {
        setPreviewUrl(getImageUrl(content.politicaIntegral.imageSrc));
      }
    }
    else if (section === 'objetivoIntegral') initialValue = content.objetivoIntegral?.text || '';

    setEditValue(initialValue);
  };

  const handleCloseModal = () => {
    setEditingSection(null);
    setEditValue('');
    setEditText('');
    setEditFile(null);
    setPreviewUrl(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ── Validaciones de archivo ──────────────────────────────────────────────
    const MAX_SIZE_MB = 5;
    const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
    const ALLOWED_TYPES: Record<string, string> = {
      'image/jpeg': 'JPG/JPEG',
      'image/png':  'PNG',
      'image/webp': 'WebP',
      'image/gif':  'GIF',
      'image/avif': 'AVIF',
      'image/svg+xml': 'SVG',
    };

    // Limpiar el input para no dejar el archivo inválido seleccionado
    const resetInput = () => { e.target.value = ''; };

    // 1. Tipo de archivo
    if (!ALLOWED_TYPES[file.type]) {
      resetInput();
      return Swal.fire({
        icon: 'warning',
        title: 'Formato no permitido',
        html: `<p>Solo se permiten imágenes: <b>${Object.values(ALLOWED_TYPES).join(', ')}</b>.</p><p class="mt-1 text-sm text-gray-500">Archivo recibido: <code>${file.type || 'desconocido'}</code></p>`,
        confirmButtonColor: '#2563eb',
      });
    }

    // 2. Tamaño
    if (file.size > MAX_SIZE_BYTES) {
      resetInput();
      const sizeMB = (file.size / 1024 / 1024).toFixed(2);
      return Swal.fire({
        icon: 'warning',
        title: 'Imagen demasiado pesada',
        html: `<p>El archivo pesa <b>${sizeMB} MB</b>. El límite es <b>${MAX_SIZE_MB} MB</b>.</p><p class="mt-1 text-sm text-gray-500">Reduce el tamaño o usa un formato más comprimido (WebP recomendado).</p>`,
        confirmButtonColor: '#2563eb',
      });
    }
    // ────────────────────────────────────────────────────────────────────────

    setEditFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!editingSection) return;

    const label = SECTION_LABELS[editingSection] || editingSection;

    // ── Validaciones ANTES de llamar al API ──────────────────────────────────
    if (editingSection === 'vision' || editingSection === 'mision') {
      if (isEffectivelyEmpty(editValue)) {
        return Swal.fire({
          icon: 'warning',
          title: 'Campo requerido',
          text: `El campo "${label}" no puede estar vacío.`,
          confirmButtonColor: '#2563eb',
        });
      }
    }

    if (editingSection === 'objetivoIntegral' || editingSection === 'politicaIntegral') {
      if (isEffectivelyEmpty(editValue)) {
        return Swal.fire({
          icon: 'warning',
          title: 'Campo requerido',
          text: `El campo "${label}" no puede estar vacío.`,
          confirmButtonColor: '#2563eb',
        });
      }
    }

    if (editingSection === 'valores') {
      const items = editValue.split('\n').map(s => s.trim()).filter(Boolean);
      if (items.length === 0) {
        return Swal.fire({
          icon: 'warning',
          title: 'Lista vacía',
          text: 'Agrega al menos un valor (uno por línea).',
          confirmButtonColor: '#2563eb',
        });
      }
      if (items.length > ITEM_LIMITS.valores) {
        return Swal.fire({
          icon: 'warning',
          title: 'Demasiados valores',
          text: `Máximo ${ITEM_LIMITS.valores} valores (tienes ${items.length}).`,
          confirmButtonColor: '#2563eb',
        });
      }
    }

    // Validación de límite de caracteres para campos de texto
    const charLimit = CHAR_LIMITS[editingSection];
    if (charLimit) {
      // Para noDiscriminacion, el texto a validar es editText (descripción)
      const textToCheck = editingSection === 'noDiscriminacion' ? editText : editValue;
      const stripped = stripHtml(textToCheck);
      if (stripped.length > charLimit) {
        return Swal.fire({
          icon: 'warning',
          title: 'Texto demasiado largo',
          html: `<p>El campo <b>${label}</b> tiene <b>${stripped.toLocaleString()} caracteres</b>.</p>
                 <p class="mt-1 text-sm text-gray-500">El límite es <b>${charLimit.toLocaleString()} caracteres</b> (${stripped.length - charLimit} de más).</p>`,
          confirmButtonColor: '#2563eb',
        });
      }
    }

    if (editingSection === 'noDiscriminacion') {
      const items = editValue.split('\n').map(s => s.trim()).filter(Boolean);
      if (items.length === 0 && isEffectivelyEmpty(editText)) {
        return Swal.fire({
          icon: 'warning',
          title: 'Sin contenido',
          text: 'Agrega al menos una descripción o un elemento a la lista.',
          confirmButtonColor: '#2563eb',
        });
      }
      // Límite de items
      if (items.length > ITEM_LIMITS.noDiscriminacion) {
        return Swal.fire({
          icon: 'warning',
          title: 'Demasiados elementos',
          text: `Máximo ${ITEM_LIMITS.noDiscriminacion} elementos en la lista (tienes ${items.length}).`,
          confirmButtonColor: '#2563eb',
        });
      }
    }
    // ────────────────────────────────────────────────────────────────────────

    setBusy(true);
    try {
      let updateData: any = {};

      if (editingSection === 'vision' || editingSection === 'mision') {
        updateData = { description: editValue };
      } else if (editingSection === 'valores') {
        updateData = { description: editValue.split('\n').map(s => s.trim()).filter(Boolean) };
      } else if (editingSection === 'noDiscriminacion') {
        updateData = {
          items: editValue.split('\n').map(s => s.trim()).filter(Boolean),
          text: editText
        };
      } else if (editingSection === 'politicaIntegral' || editingSection === 'objetivoIntegral') {
        updateData = { text: editValue };
      }

      let ok = true;
      if (editingSection === 'politicaIntegral' && editFile) {
        ok = await uploadImage(editingSection as any, editFile, updateData);
      } else if (editingSection === 'politicaIntegral' && !editFile && previewUrl === null && content?.politicaIntegral?.imageSrc) {
        ok = await updateSection(editingSection as any, updateData);
      } else {
        ok = await updateSection(editingSection as any, updateData);
      }

      if (!ok) throw new Error('La operación no retornó éxito.');

      await refetch();
      handleCloseModal();
      Swal.fire({
        icon: 'success',
        title: '¡Actualizado!',
        text: `"${label}" actualizado correctamente.`,
        position: 'center',
        showConfirmButton: false,
        timer: 1500
      });
    } catch (e) {
      // Extraer el mensaje real del error (puede venir del backend o del fetch)
      const rawMsg = e instanceof Error ? e.message : String(e);

      // Mensajes amigables para errores comunes
      let userMsg = rawMsg;
      if (/fetch|network|ERR_|failed to fetch/i.test(rawMsg)) {
        userMsg = 'Sin conexión con el servidor. Verifica que el backend esté activo.';
      } else if (/401|sesión|autenticación/i.test(rawMsg)) {
        userMsg = 'Tu sesión expiró. Por favor recarga la página e inicia sesión de nuevo.';
      } else if (/500/i.test(rawMsg)) {
        userMsg = 'Error interno del servidor (500). Intenta de nuevo en un momento.';
      } else if (/413/i.test(rawMsg)) {
        userMsg = 'El archivo es demasiado grande. Usa una imagen más pequeña.';
      }

      console.error('[Nosotros handleSave]', e);
      Swal.fire({
        icon: 'error',
        title: 'No se pudo guardar',
        text: userMsg,
        position: 'center',
        confirmButtonColor: '#d33'
      });
    } finally {
      setBusy(false);
    }
  };

  const handleInitialize = async () => {
    setBusy(true);
    try {
      // This payload matches what createContent expects in the backend
      const payload = {
        vision: { title: 'Visión', description: 'Descripción de la visión...' },
        mision: { title: 'Misión', description: 'Descripción de la misión...' },
        valores: { title: 'Valores', description: ['Valor 1', 'Valor 2'] },
        politicaIntegral: { text: 'Texto de la política integral...', imageSrc: null },
        objetivoIntegral: { text: 'Texto del objetivo integral...' },
        noDiscriminacion: { items: [], text: 'Texto descriptivo de la política de no discriminación...' }
      };

      const ok = await updateAllContent(payload as any);
      if (!ok) throw new Error('Failed to initialize');

      await refetch();
      Swal.fire({
        icon: 'success',
        title: '¡Inicializado!',
        text: 'El contenido base ha sido creado. Ahora puedes editar cada sección.',
        position: 'center',
        showConfirmButton: false,
        timer: 2000
      });
    } catch (e) {
      console.error(e);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo inicializar el contenido.',
        position: 'center',
        confirmButtonColor: '#d33'
      });
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Cargando contenido...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-100 text-center max-w-md">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Error al cargar</h3>
          <p className="text-slate-500 mb-6">{error}</p>
          <button 
            onClick={() => refetch()}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Check if content is effectively empty (all nulls)
  const hasContent = content && (content.vision || content.mision || content.valores);

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 p-6 md:p-8 font-sans text-slate-800 dark:text-slate-200">
      <style>{`
        .swal2-container {
          z-index: 99999 !important;
        }
      `}</style>

      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Nosotros</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Administra la información institucional: Misión, Visión, Valores y más.</p>
      </header>

      {!hasContent ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-slate-100 dark:border-gray-700">
          <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400">
            <Flag className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Sin Contenido</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-md text-center mb-8">
            Aún no se ha definido la información institucional. Haz clic abajo para crear la estructura inicial.
          </p>
          <button
            onClick={handleInitialize}
            disabled={busy}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
            Inicializar Contenido
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vision */}
          <SectionCard 
            sectionKey="vision"
            content={content?.vision?.description}
            onEdit={() => handleEdit('vision')}
          />
          
          {/* Mision */}
          <SectionCard 
            sectionKey="mision"
            content={content?.mision?.description}
            onEdit={() => handleEdit('mision')}
          />

          {/* Valores */}
          <SectionCard 
            sectionKey="valores"
            content={content?.valores?.description}
            onEdit={() => handleEdit('valores')}
            isList
          />

          {/* Objetivo Integral */}
          <SectionCard 
            sectionKey="objetivoIntegral"
            content={content?.objetivoIntegral?.text}
            onEdit={() => handleEdit('objetivoIntegral')}
          />

          {/* Política de Igualdad / No Discriminación */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-700 overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
            <div className="p-6 border-b border-slate-50 dark:border-gray-700 flex items-center justify-between bg-slate-50/30 dark:bg-gray-700/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">Política de Igualdad</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Igualdad, No Discriminación y Derechos Humanos.</p>
                </div>
              </div>
              <button
                onClick={() => handleEdit('noDiscriminacion')}
                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                title="Editar"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 flex-1 flex flex-col gap-4">
              {/* Texto descriptivo */}
              <RichContent content={(content?.noDiscriminacion as any)?.text} />
              {/* Lista de elementos */}
              {Array.isArray(content?.noDiscriminacion?.items) && content!.noDiscriminacion!.items!.length > 0 ? (
                <ul className="space-y-2">
                  {content!.noDiscriminacion!.items!.map((item: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-slate-600 dark:text-slate-300 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-400 dark:text-slate-500 italic text-sm">Sin elementos definidos.</p>
              )}
            </div>
          </div>

          {/* Politica Integral (Full Width) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden h-full flex flex-col">
              <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Política Integral</h3>
                    <p className="text-xs text-slate-500">Compromisos y directrices generales.</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleEdit('politicaIntegral')}
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Editar"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  {content?.politicaIntegral?.text ? (
                    /<[a-z][\s\S]*>/i.test(content.politicaIntegral.text)
                      ? <div className="text-slate-600 leading-relaxed prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: content.politicaIntegral.text }} />
                      : <p className="text-slate-600 whitespace-pre-line leading-relaxed">{content.politicaIntegral.text}</p>
                  ) : (
                    <span className="text-slate-400 italic">Sin contenido definido.</span>
                  )}
                </div>
                {content?.politicaIntegral?.imageSrc && (
                  <div className="w-full md:w-1/3 flex-shrink-0">
                    <img 
                      src={getImageUrl(content.politicaIntegral.imageSrc)} 
                      alt="Política Integral" 
                      className="w-full h-auto rounded-xl shadow-sm border border-slate-100"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingSection && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-center bg-slate-50/50 relative">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-blue-600" />
                Editar {SECTIONS_CONFIG[editingSection]?.title || 'Sección'}
              </h3>
              <button onClick={handleCloseModal} className="absolute right-4 text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="space-y-4">

                {editingSection === 'noDiscriminacion' ? (
                  <>
                     <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Descripción General</label>
                        <RichTextEditor
                          value={editText}
                          onChange={setEditText}
                          placeholder="Texto descriptivo de la política..."
                          minHeight="110px"
                          maxChars={CHAR_LIMITS.noDiscriminacion}
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                          Elementos (uno por línea)
                          <span className="ml-2 text-xs text-slate-400 font-normal">
                            Máx. {ITEM_LIMITS.noDiscriminacion} elementos
                          </span>
                        </label>
                        <textarea
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          rows={6}
                          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                          placeholder={`Elemento 1\nElemento 2\nElemento 3...`}
                        />
                        <p className="text-xs text-slate-400 text-right">
                          {editValue.split('\n').filter(s => s.trim()).length} / {ITEM_LIMITS.noDiscriminacion} elementos
                        </p>
                     </div>
                  </>
                ) : editingSection === 'valores' ? (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                      Valores (uno por línea)
                      <span className="ml-2 text-xs text-slate-400 font-normal">
                        Máx. {ITEM_LIMITS.valores} valores
                      </span>
                    </label>
                    <textarea
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      rows={8}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                      placeholder={`Austeridad\nHonestidad\nEmpatía...`}
                    />
                    <p className="text-xs text-slate-400 text-right">
                      {editValue.split('\n').filter(s => s.trim()).length} / {ITEM_LIMITS.valores} valores
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Contenido</label>
                    <RichTextEditor
                      value={editValue}
                      onChange={setEditValue}
                      placeholder="Escribe el contenido aquí..."
                      minHeight="160px"
                      maxChars={CHAR_LIMITS[editingSection ?? '']}
                    />
                  </div>
                )}

                {editingSection === 'politicaIntegral' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Imagen (Opcional)</label>
                    <div className="flex items-start gap-4">
                      <div className="relative w-32 h-32 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0">
                        {previewUrl ? (
                          <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <ImageIcon className="w-8 h-8" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={handleFileChange}
                          className="block w-full text-sm text-slate-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-lg file:border-0
                            file:text-sm file:font-semibold
                            file:bg-blue-50 file:text-blue-700
                            hover:file:bg-blue-100
                            cursor-pointer"
                        />
                        <p className="text-xs text-slate-400 mt-2">
                          Sube una imagen para acompañar el texto de la política integral.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
              <button 
                onClick={handleCloseModal}
                disabled={busy}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSave}
                disabled={busy}
                className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all flex items-center gap-2"
              >
                {busy ? 'Guardando...' : (
                  <>
                    <Save className="w-4 h-4" />
                    Guardar Cambios
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-componente: renderiza HTML rico o texto plano según el contenido
const HTML_RE = /<[a-z][\s\S]*>/i;
function RichContent({ content }: { content: any }) {
  if (!content) {
    return <p className="text-slate-400 dark:text-slate-500 italic text-sm">Sin contenido definido.</p>;
  }
  if (typeof content === 'string' && HTML_RE.test(content)) {
    return (
      <div
        className={[
          'text-slate-600 dark:text-slate-300 leading-relaxed text-sm',
          '[&_b]:font-bold [&_strong]:font-bold',
          '[&_i]:italic [&_em]:italic',
          '[&_u]:underline',
          '[&_s]:line-through [&_strike]:line-through',
          '[&_h2]:text-base [&_h2]:font-bold [&_h2]:mt-2 [&_h2]:mb-1',
          '[&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mt-1',
          '[&_ul]:list-disc [&_ul]:pl-4 [&_ul]:space-y-0.5',
          '[&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:space-y-0.5',
          '[&_p]:my-0.5',
        ].join(' ')}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }
  return (
    <p className="text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed text-sm">
      {content}
    </p>
  );
}

function SectionCard({ sectionKey, content, onEdit, isList = false }: { sectionKey: string, content: any, onEdit: () => void, isList?: boolean }) {
  const config = SECTIONS_CONFIG[sectionKey] || { title: sectionKey, icon: FileText, description: '' };
  const Icon = config.icon;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-700 overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
      <div className="p-6 border-b border-slate-50 dark:border-gray-700 flex items-center justify-between bg-slate-50/30 dark:bg-gray-700/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">{config.title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{config.description}</p>
          </div>
        </div>
        <button
          onClick={onEdit}
          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
          title="Editar"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      </div>
      <div className="p-6 flex-1">
        {isList ? (
          Array.isArray(content) && content.length > 0 ? (
            <ul className="space-y-2">
              {content.map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-slate-600 dark:text-slate-300 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-400 dark:text-slate-500 italic text-sm">Sin valores definidos.</p>
          )
        ) : (
          <RichContent content={content} />
        )}
      </div>
    </div>
  );
}
