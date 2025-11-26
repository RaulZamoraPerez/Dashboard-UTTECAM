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
import TextArea from '../../../components/form/input/TextArea';
import { 
  getSection, 
  updateSection,
  createItem, 
  updateItem, 
  deleteItem,
  uploadSectionBanner,
  ExtensionSection as IExtensionSection,
  ExtensionItem
} from '../../../services/extensionService';
import { toastSuccess, toastError, confirmDialog } from '../../../utils/alert';

const ExtensionSection = () => {
  const { slug } = useParams<{ slug: string }>();
  const [section, setSection] = useState<IExtensionSection | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ExtensionItem | null>(null);
  const [isSectionEditOpen, setIsSectionEditOpen] = useState(false);
  const [sectionTitleEdit, setSectionTitleEdit] = useState('');
  const [sectionDescriptionEdit, setSectionDescriptionEdit] = useState('');
  const [sectionBannerFile, setSectionBannerFile] = useState<File | null>(null);
  
  // Form states
  const [itemTitle, setItemTitle] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemImage, setItemImage] = useState<File | null>(null);

  const fetchSection = useCallback(async () => {
    if (!slug) return;
    try {
      setLoading(true);
      const data = await getSection(slug);
      setSection(data);
    } catch (error) {
      console.error(error);
      toastError('Error al cargar la sección');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchSection();
  }, [fetchSection]);

  const handleOpenModal = (item?: ExtensionItem) => {
    if (item) {
      setEditingItem(item);
      setItemTitle(item.title);
      setItemDescription(item.description || '');
    } else {
      setEditingItem(null);
      setItemTitle('');
      setItemDescription('');
    }
    setItemImage(null);
    setIsModalOpen(true);
  };

  const handleOpenSectionEdit = () => {
    if (!section) return;
    setSectionTitleEdit(section.title);
    setSectionDescriptionEdit(section.description || '');
    setIsSectionEditOpen(true);
  };

  const getAssetUrl = (url: string) => {
    if (!url) return '';
    // If the url is relative and starts with /uploads or /public, add the API base host
    if (url.startsWith('/uploads') || url.startsWith('/public')) {
      const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:3002/api').replace(/\/api\/?$/, '');
      return encodeURI(`${apiBase}${url}`);
    }
    return url;
  };

  const handleSaveSectionEdit = async () => {
    if (!slug) return;
    try {
      await updateSection(slug, { title: sectionTitleEdit, description: sectionDescriptionEdit });
      toastSuccess('Sección actualizada correctamente');
      setIsSectionEditOpen(false);
      fetchSection();
    } catch (error) {
      console.error(error);
      toastError('Error al actualizar la sección');
    }
  };

  const handleUploadBanner = async () => {
    if (!slug || !sectionBannerFile) return;
    try {
      setLoading(true);
      await uploadSectionBanner(slug, sectionBannerFile);
      toastSuccess('Banner actualizado correctamente');
      setSectionBannerFile(null);
      fetchSection();
    } catch (error) {
      console.error(error);
      toastError('Error al subir el banner');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setItemTitle('');
    setItemDescription('');
    setItemImage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug) return;

    const formData = new FormData();
    formData.append('title', itemTitle);
    formData.append('description', itemDescription);
    if (itemImage) {
      formData.append('image', itemImage);
    }

    try {
      if (editingItem) {
        await updateItem(editingItem.id, formData);
        toastSuccess('Elemento actualizado correctamente');
      } else {
        await createItem(slug, formData);
        toastSuccess('Elemento creado correctamente');
      }
      handleCloseModal();
      fetchSection();
    } catch (error) {
      console.error(error);
      toastError('Error al guardar el elemento');
    }
  };

  const handleDelete = async (id: number) => {
    const isConfirmed = await confirmDialog({ title: '¿Estás seguro?', text: 'Esta acción no se puede deshacer.' });

    if (isConfirmed) {
      try {
        await deleteItem(id);
        toastSuccess('Elemento eliminado correctamente');
        fetchSection();
      } catch (error) {
        console.error(error);
        toastError('Error al eliminar el elemento');
      }
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (!section) return <div>Sección no encontrada</div>;
  const hideElementsSection = slug === 'talleres-culturales' || slug === 'talleres-deportivos';

  return (
    <>
      <PageBreadcrumb pageTitle={section.title} />
      <div className="space-y-6">
        <ComponentCard title="Información de la Sección">
          <div className="space-y-4">
            <div>
              <Label>Título</Label>
              <div className="flex items-center gap-2">
                <Input value={section.title} disabled />
                <Button size="sm" variant="outline" onClick={handleOpenSectionEdit}>Editar Sección</Button>
              </div>
            </div>
            <div>
              <Label>Descripción</Label>
              <TextArea value={section.description || ''} disabled />
            </div>
            <div>
              <Label>Banner actual</Label>
              {section.banner_url ? (
                <div className="mt-2">
                  <img src={getAssetUrl(section.banner_url)} alt="Sección banner" className="w-full h-40 object-cover rounded" />
                </div>
              ) : (
                <p className="text-sm text-gray-500">No hay banner asignado</p>
              )}
            </div>
          </div>
        </ComponentCard>

        {!hideElementsSection && (
          <ComponentCard title="Elementos">
            <div className="mb-4">
              <Button onClick={() => handleOpenModal()}>Agregar Elemento</Button>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableCell>Imagen</TableCell>
                    <TableCell>Título</TableCell>
                    <TableCell>Descripción</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {section.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {item.image_url && (
                          <img 
                            src={getAssetUrl(item.image_url)} 
                            alt={item.title} 
                            className="w-16 h-16 object-cover rounded"
                          />
                        )}
                      </TableCell>
                      <TableCell>{item.title}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={() => handleOpenModal(item)}>
                            Editar
                          </Button>
                          <Button size="sm" variant="danger" onClick={() => handleDelete(item.id)}>
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
        )}
      </div>

      {!hideElementsSection && (
        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingItem ? 'Editar Elemento' : 'Nuevo Elemento'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Título</Label>
            <Input 
              id="title" 
              value={itemTitle} 
              onChange={(e) => setItemTitle(e.target.value)} 
              required 
            />
          </div>
          <div>
            <Label htmlFor="description">Descripción</Label>
            <TextArea 
              id="description" 
              value={itemDescription} 
              onChange={(value) => setItemDescription(value)} 
            />
          </div>
          <div>
            <Label htmlFor="image">Imagen</Label>
            <Input 
              id="image" 
              type="file" 
              accept="image/*"
              onChange={(e) => setItemImage(e.target.files ? e.target.files[0] : null)} 
            />
                {editingItem?.image_url && !itemImage && (
              <div className="mt-2">
                <p className="text-sm text-gray-500">Imagen actual:</p>
                    <img src={getAssetUrl(editingItem.image_url)} alt="Current" className="h-20 object-cover rounded" />
              </div>
            )}
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <Button type="button" variant="outline" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button type="submit">
              Guardar
            </Button>
          </div>
        </form>
        </Modal>
      )}

      {/* Edit Section Modal */}
      <Modal isOpen={isSectionEditOpen} onClose={() => setIsSectionEditOpen(false)} title="Editar Sección">
        <div className="space-y-4">
          <div>
            <Label>Título</Label>
            <Input value={sectionTitleEdit} onChange={(e) => setSectionTitleEdit(e.target.value)} />
          </div>
          <div>
            <Label>Descripción</Label>
            <TextArea value={sectionDescriptionEdit} onChange={(v) => setSectionDescriptionEdit(v)} />
          </div>
            <div>
              <Label>Banner de la sección</Label>
              <input type="file" accept="image/*" onChange={(e) => setSectionBannerFile(e.target.files ? e.target.files[0] : null)} />
                {section?.banner_url && !sectionBannerFile && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500">Banner actual:</p>
                  <img src={getAssetUrl(section.banner_url)} alt="Banner" className="h-32 object-cover rounded" />
                </div>
              )}
            </div>
          <div className="flex justify-end space-x-2 mt-4">
            <Button type="button" variant="outline" onClick={() => setIsSectionEditOpen(false)}>Cancelar</Button>
            <Button type="button" onClick={handleSaveSectionEdit}>Guardar</Button>
            <Button type="button" variant="primary" onClick={handleUploadBanner} disabled={!sectionBannerFile}>Subir Banner</Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ExtensionSection;