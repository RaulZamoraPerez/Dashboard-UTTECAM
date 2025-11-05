import { useState } from 'react';
import { Apartado, Documento } from '../types/apartados';

export const useApartados = (apartadosIniciales: Apartado[] = []) => {
  const [apartados, setApartados] = useState<Apartado[]>(apartadosIniciales);
  const [apartadoSeleccionado, setApartadoSeleccionado] = useState<Apartado | null>(null);

  const crearApartado = (titulo: string, descripcion: string) => {
    if (!titulo.trim()) {
      alert('Por favor ingresa un título para el apartado');
      return false;
    }

    const nuevoApartado: Apartado = {
      id: Date.now().toString(),
      titulo,
      descripcion,
      fechaCreacion: new Date(),
      documentos: []
    };

    setApartados([...apartados, nuevoApartado]);
    return true;
  };

  const eliminarApartado = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este apartado?')) {
      setApartados(apartados.filter(apt => apt.id !== id));
      return true;
    }
    return false;
  };

  const seleccionarApartado = (apartado: Apartado) => {
    setApartadoSeleccionado(apartado);
  };

  const deseleccionarApartado = () => {
    setApartadoSeleccionado(null);
  };

  const agregarDocumento = (nombre: string, archivo: File | null) => {
    if (!nombre.trim()) {
      alert('Por favor ingresa un nombre para el documento');
      return false;
    }

    if (!archivo) {
      alert('Por favor selecciona un archivo');
      return false;
    }

    if (!apartadoSeleccionado) {
      alert('No hay un apartado seleccionado');
      return false;
    }

    const nuevoDocumento: Documento = {
      id: Date.now().toString(),
      nombre,
      archivo: archivo.name,
      fechaSubida: new Date()
    };

    const apartadosActualizados = apartados.map(apt => {
      if (apt.id === apartadoSeleccionado.id) {
        return {
          ...apt,
          documentos: [...apt.documentos, nuevoDocumento]
        };
      }
      return apt;
    });

    setApartados(apartadosActualizados);
    
    const apartadoActualizado = apartadosActualizados.find(
      apt => apt.id === apartadoSeleccionado.id
    );
    
    if (apartadoActualizado) {
      setApartadoSeleccionado(apartadoActualizado);
    }

    return true;
  };

  const eliminarDocumento = (documentoId: string) => {
    if (!confirm('¿Estás seguro de eliminar este documento?')) {
      return false;
    }

    if (!apartadoSeleccionado) {
      return false;
    }

    const apartadosActualizados = apartados.map(apt => {
      if (apt.id === apartadoSeleccionado.id) {
        return {
          ...apt,
          documentos: apt.documentos.filter(doc => doc.id !== documentoId)
        };
      }
      return apt;
    });

    setApartados(apartadosActualizados);
    
    const apartadoActualizado = apartadosActualizados.find(
      apt => apt.id === apartadoSeleccionado.id
    );
    
    if (apartadoActualizado) {
      setApartadoSeleccionado(apartadoActualizado);
    }

    return true;
  };

  const editarDocumento = (documentoId: string, nombre: string, archivo?: File | null) => {
    if (!nombre.trim()) {
      alert('Por favor ingresa un nombre para el documento');
      return false;
    }

    if (!apartadoSeleccionado) {
      alert('No hay un apartado seleccionado');
      return false;
    }

    const apartadosActualizados = apartados.map(apt => {
      if (apt.id === apartadoSeleccionado.id) {
        return {
          ...apt,
          documentos: apt.documentos.map(doc => {
            if (doc.id === documentoId) {
              return {
                ...doc,
                nombre,
                archivo: archivo ? archivo.name : doc.archivo,
                fechaSubida: archivo ? new Date() : doc.fechaSubida
              };
            }
            return doc;
          })
        };
      }
      return apt;
    });

    setApartados(apartadosActualizados);
    
    const apartadoActualizado = apartadosActualizados.find(
      apt => apt.id === apartadoSeleccionado.id
    );
    
    if (apartadoActualizado) {
      setApartadoSeleccionado(apartadoActualizado);
    }

    return true;
  };

  return {
    apartados,
    apartadoSeleccionado,
    crearApartado,
    eliminarApartado,
    seleccionarApartado,
    deseleccionarApartado,
    agregarDocumento,
    eliminarDocumento,
    editarDocumento,
  };
};
