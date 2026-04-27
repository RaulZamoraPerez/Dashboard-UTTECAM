/**
 * RichTextEditor — Editor de texto enriquecido sin dependencias externas.
 * Usa contentEditable + execCommand para formateo básico.
 *
 * Props:
 *   value      → HTML actual del campo
 *   onChange   → callback con el nuevo HTML
 *   maxChars   → límite de caracteres (sobre texto sin HTML). Opcional.
 *   placeholder
 *   minHeight
 */
import React, { useRef, useEffect, useCallback, useState } from 'react';
import {
  Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Heading2, Heading3,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  /** Máximo de caracteres (texto plano, sin HTML). Ej: 3000 */
  maxChars?: number;
  placeholder?: string;
  minHeight?: string;
}

// ─── Helper: texto plano sin tags ────────────────────────────────────────────
const stripTags = (html: string) =>
  html.replace(/<[^>]*>/g, '').replace(/&nbsp;/gi, ' ').replace(/&[a-z]+;/gi, ' ').trim();

// ─── Botón de toolbar ─────────────────────────────────────────────────────────
interface ToolBtnProps {
  title: string;
  icon?: React.ElementType;
  label?: string;
  onClick: () => void;
  active?: boolean;
}
function ToolBtn({ title, icon: Icon, label, onClick, active }: ToolBtnProps) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      className={`
        px-1.5 py-1 rounded text-xs font-medium transition-colors select-none
        ${active
          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white'
        }
      `}
    >
      {Icon ? <Icon className="w-3.5 h-3.5" /> : label}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1 self-center shrink-0" />;
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function RichTextEditor({
  value,
  onChange,
  maxChars,
  placeholder = 'Escribe el contenido aquí...',
  minHeight = '140px',
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
  const [charCount, setCharCount] = useState(0);

  // Inicializar contenido solo al montar
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = value || '';
      setCharCount(stripTags(value || '').length);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateActiveFormats = useCallback(() => {
    const formats = new Set<string>();
    if (document.queryCommandState('bold')) formats.add('bold');
    if (document.queryCommandState('italic')) formats.add('italic');
    if (document.queryCommandState('underline')) formats.add('underline');
    if (document.queryCommandState('strikeThrough')) formats.add('strikeThrough');
    if (document.queryCommandState('justifyCenter')) formats.add('justifyCenter');
    if (document.queryCommandState('justifyRight')) formats.add('justifyRight');
    if (document.queryCommandState('justifyFull')) formats.add('justifyFull');
    if (document.queryCommandState('insertUnorderedList')) formats.add('ul');
    if (document.queryCommandState('insertOrderedList')) formats.add('ol');
    setActiveFormats(formats);
  }, []);

  const exec = useCallback((command: string, val?: string) => {
    document.execCommand(command, false, val ?? undefined);
    editorRef.current?.focus();
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
      setCharCount(stripTags(editorRef.current.innerHTML).length);
    }
    updateActiveFormats();
  }, [onChange, updateActiveFormats]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
      setCharCount(stripTags(editorRef.current.innerHTML).length);
    }
  }, [onChange]);

  const isActive = (fmt: string) => activeFormats.has(fmt);

  // ── Colores del contador ──────────────────────────────────────────────────
  const getCounterStyle = () => {
    if (!maxChars) return 'text-slate-400';
    const pct = charCount / maxChars;
    if (pct >= 1) return 'text-red-600 font-semibold';
    if (pct >= 0.8) return 'text-amber-500 font-medium';
    return 'text-slate-400';
  };

  const getBarWidth = () => {
    if (!maxChars) return '0%';
    return `${Math.min((charCount / maxChars) * 100, 100)}%`;
  };

  const getBarColor = () => {
    if (!maxChars) return 'bg-blue-400';
    const pct = charCount / maxChars;
    if (pct >= 1) return 'bg-red-500';
    if (pct >= 0.8) return 'bg-amber-400';
    return 'bg-blue-400';
  };

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">

      {/* ── Barra de herramientas ─────────────────────────────────────────── */}
      <div className="flex items-center flex-wrap gap-0.5 px-3 py-2 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 select-none">
        <ToolBtn title="Párrafo normal" label="¶" onClick={() => exec('formatBlock', 'p')} />
        <ToolBtn title="Encabezado H2"  icon={Heading2} onClick={() => exec('formatBlock', 'h2')} />
        <ToolBtn title="Encabezado H3"  icon={Heading3} onClick={() => exec('formatBlock', 'h3')} />
        <Divider />
        <ToolBtn title="Negritas (Ctrl+B)"  icon={Bold}          onClick={() => exec('bold')}          active={isActive('bold')} />
        <ToolBtn title="Cursiva (Ctrl+I)"   icon={Italic}        onClick={() => exec('italic')}        active={isActive('italic')} />
        <ToolBtn title="Subrayado (Ctrl+U)" icon={Underline}     onClick={() => exec('underline')}     active={isActive('underline')} />
        <ToolBtn title="Tachado"            icon={Strikethrough} onClick={() => exec('strikeThrough')} active={isActive('strikeThrough')} />
        <Divider />
        <ToolBtn title="Izquierda"  icon={AlignLeft}    onClick={() => exec('justifyLeft')}   active={!isActive('justifyCenter') && !isActive('justifyRight') && !isActive('justifyFull')} />
        <ToolBtn title="Centrar"    icon={AlignCenter}  onClick={() => exec('justifyCenter')} active={isActive('justifyCenter')} />
        <ToolBtn title="Derecha"    icon={AlignRight}   onClick={() => exec('justifyRight')}  active={isActive('justifyRight')} />
        <ToolBtn title="Justificar" icon={AlignJustify} onClick={() => exec('justifyFull')}   active={isActive('justifyFull')} />
        <Divider />
        <ToolBtn title="Lista con viñetas" icon={List}        onClick={() => exec('insertUnorderedList')} active={isActive('ul')} />
        <ToolBtn title="Lista numerada"    icon={ListOrdered} onClick={() => exec('insertOrderedList')}   active={isActive('ol')} />
      </div>

      {/* ── Área de edición ───────────────────────────────────────────────── */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyUp={updateActiveFormats}
        onMouseUp={updateActiveFormats}
        onSelect={updateActiveFormats}
        className={`
          px-4 py-3 text-sm text-slate-700 dark:text-slate-200
          focus:outline-none
          [&_b]:font-bold [&_strong]:font-bold
          [&_i]:italic [&_em]:italic
          [&_u]:underline
          [&_s]:line-through [&_strike]:line-through
          [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-2 [&_h2]:mb-1
          [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-1
          [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1
          [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1
          [&_p]:my-1
          empty:before:content-[attr(data-placeholder)]
          empty:before:text-slate-400 empty:before:pointer-events-none
        `}
        style={{ minHeight }}
        data-placeholder={placeholder}
      />

      {/* ── Contador de caracteres ─────────────────────────────────────────── */}
      {maxChars && (
        <div className="px-3 pb-2 pt-1 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
          {/* Barra de progreso */}
          <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-1">
            <div
              className={`h-full rounded-full transition-all duration-200 ${getBarColor()}`}
              style={{ width: getBarWidth() }}
            />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {charCount >= maxChars * 0.8 && charCount < maxChars
                ? '⚠️ Cerca del límite'
                : charCount >= maxChars
                  ? '🚫 Límite alcanzado'
                  : ''}
            </span>
            <span className={`text-xs tabular-nums ${getCounterStyle()}`}>
              {charCount.toLocaleString()} / {maxChars.toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

