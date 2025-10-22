import { useState } from 'react';
import { Apartado, Documento } from '../../types/apartados';
import { useApartados } from '../../hooks/useApartados';
import { ListaApartados, VistaApartado } from '../../components/apartados';
import { ModalCrearApartado, ModalSubirDocumento } from '../../components/modals';

const apartadosIniciales: Apartado[] = [
  {
    id: '1',
    titulo: 'Políticas de Equidad',
    descripcion: 'Documentos de políticas y lineamientos de equidad de género',
    fechaCreacion: new Date('2025-01-08'),
    documentos: []
  },
  {
    id: '2',
    titulo: 'Capacitaciones',
    descripcion: 'Material de capacitación y sensibilización',
    fechaCreacion: new Date('2025-02-12'),
    documentos: []
  },
  {
    id: '3',
    titulo: 'Reportes y Estadísticas',
    descripcion: 'Informes sobre equidad de género en la institución',
    fechaCreacion: new Date('2025-03-05'),
    documentos: []
  }
];

export default function CordinacionGenero() {
  const {
    apartados,
    apartadoSeleccionado,
    crearApartado,
    eliminarApartado,
    seleccionarApartado,
    deseleccionarApartado,
    agregarDocumento,
    eliminarDocumento,
    editarDocumento,
  } = useApartados(apartadosIniciales);

  const [vistaActual, setVistaActual] = useState<'lista' | 'apartado'>('lista');
  const [mostrarModalApartado, setMostrarModalApartado] = useState(false);
  const [mostrarModalDocumento, setMostrarModalDocumento] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [documentoEditando, setDocumentoEditando] = useState<string | null>(null);

  // Estados para formulario de apartado
  const [nuevoApartadoTitulo, setNuevoApartadoTitulo] = useState('');
  const [nuevoApartadoDescripcion, setNuevoApartadoDescripcion] = useState('');

  // Estados para formulario de documento
  const [nuevoDocumentoNombre, setNuevoDocumentoNombre] = useState('');
  const [nuevoDocumentoArchivo, setNuevoDocumentoArchivo] = useState<File | null>(null);

  const handleCrearApartado = (titulo: string, descripcion: string) => {
    if (crearApartado(titulo, descripcion)) {
      setNuevoApartadoTitulo('');
      setNuevoApartadoDescripcion('');
      setMostrarModalApartado(false);
    }
  };

  const handleSubirDocumento = (nombre: string, archivo: File | null) => {
    if (modoEdicion && documentoEditando) {
      if (editarDocumento(documentoEditando, nombre, archivo)) {
        resetearFormularioDocumento();
      }
    } else {
      if (agregarDocumento(nombre, archivo)) {
        resetearFormularioDocumento();
      }
    }
  };

  const handleEditarDocumento = (documento: Documento) => {
    setNuevoDocumentoNombre(documento.nombre);
    setNuevoDocumentoArchivo(null);
    setDocumentoEditando(documento.id);
    setModoEdicion(true);
    setMostrarModalDocumento(true);
  };

  const resetearFormularioDocumento = () => {
    setNuevoDocumentoNombre('');
    setNuevoDocumentoArchivo(null);
    setDocumentoEditando(null);
    setModoEdicion(false);
    setMostrarModalDocumento(false);
  };

  const handleVerApartado = (apartado: Apartado) => {
    seleccionarApartado(apartado);
    setVistaActual('apartado');
  };

  const handleVolverALista = () => {
    setVistaActual('lista');
    deseleccionarApartado();
  };

  return (
    <div className="p-6">
      {vistaActual === 'lista' ? (
        <ListaApartados
          apartados={apartados}
          onVerApartado={handleVerApartado}
          onEliminarApartado={eliminarApartado}
          onCrearApartado={() => setMostrarModalApartado(true)}
          titulo="Coordinación de Género - Gestión de Documentos"
          subtitulo="Organiza documentos de políticas, capacitaciones y reportes de equidad"
          colorPrimario="#9333ea"
        />
      ) : apartadoSeleccionado ? (
        <VistaApartado
          apartado={apartadoSeleccionado}
          onVolver={handleVolverALista}
          onSubirDocumento={() => {
            setModoEdicion(false);
            setDocumentoEditando(null);
            setMostrarModalDocumento(true);
          }}
          onEliminarDocumento={eliminarDocumento}
          onEditarDocumento={handleEditarDocumento}
          colorPrimario="#9333ea"
        />
      ) : null}

      {/* Modal para crear apartado */}
      <ModalCrearApartado
        isOpen={mostrarModalApartado}
        onClose={() => setMostrarModalApartado(false)}
        onSubmit={handleCrearApartado}
        titulo={nuevoApartadoTitulo}
        setTitulo={setNuevoApartadoTitulo}
        descripcion={nuevoApartadoDescripcion}
        setDescripcion={setNuevoApartadoDescripcion}
      />

      {/* Modal para subir documento */}
      <ModalSubirDocumento
        isOpen={mostrarModalDocumento}
        onClose={resetearFormularioDocumento}
        onSubmit={handleSubirDocumento}
        nombre={nuevoDocumentoNombre}
        setNombre={setNuevoDocumentoNombre}
        archivo={nuevoDocumentoArchivo}
        setArchivo={setNuevoDocumentoArchivo}
        isEditing={modoEdicion}
        documentoId={documentoEditando || undefined}
      />
    </div>
  );
}
