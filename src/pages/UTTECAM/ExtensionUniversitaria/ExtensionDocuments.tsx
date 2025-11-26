import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router';
import PageBreadcrumb from '../../../components/common/PageBreadCrumb';
import ComponentCard from '../../../components/common/ComponentCard';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import Button from '../../../components/ui/button/Button';
import Modal from '../../../components/ui/modal';
import Label from '../../../components/form/Label';
import Input from '../../../components/form/input/InputField';
import { 
  getDocuments, 
  createDocument, 
  deleteDocument,
  ExtensionDocument
} from '../../../services/extensionService';
import { toastSuccess, toastError, confirmDialog } from '../../../utils/alert';

const ExtensionDocuments = () => {
  const { category } = useParams<{ category: string }>();
  const [documents, setDocuments] = useState<ExtensionDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form states
  const [docTitle, setDocTitle] = useState('');
  const [docFile, setDocFile] = useState<File | null>(null);

  const fetchDocuments = useCallback(async () => {
    if (!category) return;
    try {
      setLoading(true);
      const data = await getDocuments(category);
      setDocuments(data);
    } catch (error) {
      console.error(error);
      toastError('Error al cargar los documentos');
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleOpenModal = () => {
    setDocTitle('');
    setDocFile(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setDocTitle('');
    setDocFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !docFile) {
        toastError('Debes seleccionar un archivo');
        return;
    }

    const formData = new FormData();
    formData.append('title', docTitle);
    formData.append('category', category);
    formData.append('file', docFile);

    try {
      await createDocument(formData);
      toastSuccess('Documento subido correctamente');
      handleCloseModal();
      fetchDocuments();
    } catch (error) {
      console.error(error);
      toastError('Error al subir el documento');
    }
  };

  const handleDelete = async (id: number) => {
    const isConfirmed = await confirmDialog({ title: '¿Estás seguro?', text: 'Esta acción no se puede deshacer.' });

    if (isConfirmed) {
      try {
        await deleteDocument(id);
        toastSuccess('Documento eliminado correctamente');
        fetchDocuments();
      } catch (error) {
        console.error(error);
        toastError('Error al eliminar el documento');
      }
    }
  };

  const getTitle = () => {
      switch(category) {
          case 'gaceta': return 'Gaceta Universitaria';
          case 'promocion': return 'Promoción Institucional';
          default: return 'Documentos';
      }
  }

  if (loading) return <div>Cargando...</div>;

  return (
    <>
      <PageBreadcrumb pageTitle={getTitle()} />
      <div className="space-y-6">
        <ComponentCard title="Documentos">
          <div className="mb-4">
            <Button onClick={handleOpenModal}>Subir Documento</Button>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Título</TableCell>
                  <TableCell>Archivo</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>{doc.title}</TableCell>
                    <TableCell>
                        <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            Ver Archivo
                        </a>
                    </TableCell>
                    <TableCell>{new Date(doc.publication_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="danger" onClick={() => handleDelete(doc.id)}>
                          Eliminar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ComponentCard>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Subir Documento">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Título</Label>
            <Input 
              id="title" 
              value={docTitle} 
              onChange={(e) => setDocTitle(e.target.value)} 
              required 
            />
          </div>
          <div>
            <Label htmlFor="file">Archivo (PDF)</Label>
            <Input 
              id="file" 
              type="file" 
              accept=".pdf"
              onChange={(e) => setDocFile(e.target.files ? e.target.files[0] : null)} 
              required
            />
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <Button type="button" variant="outline" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button type="submit">
              Subir
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default ExtensionDocuments;