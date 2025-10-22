import { useState } from 'react';
import { Apartado, Documento } from '../../types/apartados';
import { useApartados } from '../../hooks/useApartados';
import { ListaApartados, VistaApartado } from '../../components/apartados';
import { ModalCrearApartado, ModalSubirDocumento } from '../../components/modals';

const apartadosIniciales: Apartado[] = [
  {
    id: '1',
    titulo: 'Contratos',
    descripcion: 'Contratos de empleados y convenios',
    fechaCreacion: new Date('2025-01-10'),
    documentos: []
  },
  {
    id: '2',
    titulo: 'Nóminas',
    descripcion: 'Registros de nóminas mensuales',
    fechaCreacion: new Date('2025-02-05'),
    documentos: []
  },
  {
    id: '3',
    titulo: 'Evaluaciones de Desempeño',
    descripcion: 'Evaluaciones anuales del personal',
    fechaCreacion: new Date('2025-03-01'),
    documentos: []
  }
];

export default function RecursosHumanos() {
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
          titulo="Recursos Humanos - Gestión de Documentos"
          subtitulo="Administra documentos de personal, nóminas y evaluaciones"
          colorPrimario="#d1672a"
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
          colorPrimario="#0a9782"
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

