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
  toggleSectionEnabled,
  ExtensionSection as IExtensionSection,
  ExtensionItem
} from '../../../services/extensionService';
import { toastSuccess, toastError, confirmDialog } from '../../../utils/alert';

const ExtensionSection = () => {
  const { slug } = useParams<{ slug: string }>();
  const [section, setSection] = useState<IExtensionSection | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<ExtensionItem | null>(null);
  const [editingItemId, setEditingItemId] = useState<number | null>(null); // id of item currently editing inline; -1 => new
  const [isSectionEditOpen, setIsSectionEditOpen] = useState(false);
  const [sectionTitleEdit, setSectionTitleEdit] = useState('');
  const [sectionDescriptionEdit, setSectionDescriptionEdit] = useState('');
  const [sectionBannerFile, setSectionBannerFile] = useState<File | null>(null);
  
  // Form states
  const [itemTitle, setItemTitle] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemImage, setItemImage] = useState<File | null>(null);
  const [rowSaving, setRowSaving] = useState(false);

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

  const startInlineEdit = (item?: ExtensionItem, openFileSelector?: boolean) => {
    if (item) {
      setEditingItem(item);
      setEditingItemId(item.id);
      setItemTitle(item.title);
      setItemDescription(item.description || '');
      setItemImage(null);
      if (openFileSelector) {
        setTimeout(() => {
          const el = document.getElementById(`item-inline-image-${item.id}`) as HTMLInputElement | null;
          if (el) el.click();
        }, 10);
      }
    } else {
      // new item
      setEditingItem(null);
      setEditingItemId(-1);
      setItemTitle('');
      setItemDescription('');
      setItemImage(null);
      if (openFileSelector) {
        setTimeout(() => {
          const el = document.getElementById(`item-inline-image-new`) as HTMLInputElement | null;
          if (el) el.click();
        }, 10);
      }
    }
  };

  const cancelInlineEdit = () => {
    setEditingItem(null);
    setEditingItemId(null);
    setItemTitle('');
    setItemDescription('');
    setItemImage(null);
  };

  const handleSaveInline = async (id?: number) => {
    if (!slug) return;
    setRowSaving(true);
    try {
      const formData = new FormData();
      formData.append('title', itemTitle);
      formData.append('description', itemDescription);
      if (itemImage) formData.append('image', itemImage);

      if (editingItemId === -1) {
        await createItem(slug, formData);
        toastSuccess('Elemento creado correctamente');
      } else {
        const itemId = id ?? editingItemId;
        if (!itemId || itemId <= 0) {
          toastError('ID de elemento inválido');
          return;
        }
        await updateItem(itemId, formData);
        toastSuccess('Elemento actualizado correctamente');
      }
      cancelInlineEdit();
      fetchSection();
    } catch (error) {
      console.error(error);
      toastError('Error al guardar el elemento');
    } finally {
      setRowSaving(false);
    }
  };

  const handleOpenSectionEdit = (openFileSelector?: boolean) => {
    if (!section) return;
    // Only initialize the edit fields when opening the editor for the first time
    if (!isSectionEditOpen) {
      setSectionTitleEdit(section.title);
      setSectionDescriptionEdit(section.description || '');
      setIsSectionEditOpen(true);
    }
    // Always support opening the file selector even if editor is already open
    if (openFileSelector) {
      setTimeout(() => {
        const el = document.getElementById('section-banner-input') as HTMLInputElement | null;
        if (el) el.click();
      }, 10);
    }
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

  const handleToggleEnabled = async () => {
    if (!slug) return;
    try {
      const result = await toggleSectionEnabled(slug);
      toastSuccess(result.message || 'Estado actualizado correctamente');
      fetchSection();
    } catch (error) {
      console.error(error);
      toastError('Error al cambiar el estado de la sección');
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (!section) {
    return (
      <>
        <PageBreadcrumb pageTitle="Sección no encontrada" />
        <div className="space-y-6">
          <ComponentCard title="Sección no encontrada">
            <div className="flex items-center gap-6 p-4">
              <div className="p-3 rounded-full bg-red-50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.29 3.86L1.82 18a2.3 2.3 0 0 0 2 3.5h16.36a2.3 2.3 0 0 0 2-3.5L13.71 3.86a2 2 0 0 0-3.42 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v4m0 4h.01"/></svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Sección no encontrada</h3>
                <p className="text-gray-600 mt-1">No existe una sección con el slug solicitado. Comprueba la URL o crea la sección desde el módulo de Extensión Universitaria.</p>
                <div className="mt-4">
                  <Button size="sm" variant="primary" onClick={() => window.location.href = '/'}>Ir al listado de secciones</Button>
                </div>
              </div>
            </div>
          </ComponentCard>
        </div>
      </>
    );
  }

  // Secciones que solo muestran banner (sin gestión de elementos)
  const bannerOnlySections = ['talleres-culturales', 'talleres-deportivos', 'servicio-medico', 'ferias-profesiograficas', 'visitas-guiadas'];
  const isBannerOnly = slug ? bannerOnlySections.includes(slug) : false;

  return (
    <>
      <PageBreadcrumb pageTitle={section.title} />
      <div className="space-y-6">
        <ComponentCard title="Información de la Sección">
          <div className="space-y-4">
            {/* Status Toggle Switch */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <Label className="text-base font-semibold">Estado de la Sección</Label>
                <p className="text-sm text-gray-600 mt-1">
                  {section.is_enabled 
                    ? 'La sección está habilitada y muestra contenido real' 
                    : 'La sección está deshabilitada y muestra un placeholder'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-sm font-medium ${section.is_enabled ? 'text-green-600' : 'text-gray-500'}`}>
                  {section.is_enabled ? 'Habilitada' : 'Deshabilitada'}
                </span>
                <button
                  onClick={handleToggleEnabled}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    section.is_enabled ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      section.is_enabled ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div>
              <Label>Título</Label>
                <div className="flex items-center gap-2">
                <div onClick={() => handleOpenSectionEdit()} role="button" className="w-full cursor-pointer">
                  <Input value={isSectionEditOpen ? sectionTitleEdit : section.title} disabled={!isSectionEditOpen} onChange={(e) => setSectionTitleEdit(e.target.value)} />
                </div>
                {!isSectionEditOpen ? (
                  <Button size="sm" variant="outline" onClick={() => handleOpenSectionEdit()}>Editar Sección</Button>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="primary" onClick={handleSaveSectionEdit}>Guardar</Button>
                    <Button size="sm" variant="outline" onClick={() => setIsSectionEditOpen(false)}>Cancelar</Button>
                  </div>
                )}
              </div>
            </div>
            <div>
              <Label>Descripción</Label>
              <div role="button" onClick={() => handleOpenSectionEdit()} className="cursor-pointer">
                <TextArea value={isSectionEditOpen ? sectionDescriptionEdit : (section.description || '')} disabled={!isSectionEditOpen} onChange={(value) => setSectionDescriptionEdit(value)} />
              </div>
            </div>
            <div>
              <Label>Banner actual</Label>
              {section.banner_url ? (
                <div className="mt-2 max-w-4xl">
                  <div className="relative w-full overflow-hidden rounded-lg border-2 border-gray-200 shadow-md hover:shadow-lg transition-shadow cursor-pointer" 
                       onClick={() => handleOpenSectionEdit(true)}
                       title="Click para editar banner">
                    <img 
                      src={getAssetUrl(section.banner_url)} 
                      alt="Sección banner" 
                      className="w-full h-auto object-contain bg-white"
                      style={{ maxHeight: '400px' }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Click en la imagen para cambiar el banner</p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No hay banner asignado</p>
              )}
              {isSectionEditOpen && (
                <div className="mt-2 flex items-center gap-2">
                  <input id="section-banner-input" type="file" accept="image/*" onChange={(e) => setSectionBannerFile(e.target.files ? e.target.files[0] : null)} />
                  <Button size="sm" onClick={handleUploadBanner} disabled={!sectionBannerFile}>Subir Banner</Button>
                </div>
              )}
            </div>
          </div>
        </ComponentCard>

        {!isBannerOnly && (
          <ComponentCard title="Elementos">
            <div className="mb-4">
              <Button onClick={() => startInlineEdit(undefined)}>Agregar Elemento</Button>
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
                  {editingItemId === -1 && (
                    <TableRow key="new-item">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Input id={`item-inline-image-new`} type="file" accept="image/*" onChange={(e) => setItemImage(e.target.files ? e.target.files[0] : null)} />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input value={itemTitle} onChange={(e) => setItemTitle(e.target.value)} />
                      </TableCell>
                      <TableCell>
                        <TextArea value={itemDescription} onChange={(v) => setItemDescription(v)} />
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="primary" onClick={() => handleSaveInline()} disabled={rowSaving}>Guardar</Button>
                          <Button size="sm" variant="outline" onClick={cancelInlineEdit}>Cancelar</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  {section.items.map((item) => (
                      <TableRow key={item.id}>
                        {editingItemId === item.id ? (
                          <>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {editingItem?.image_url && !itemImage ? (
                                  <img src={getAssetUrl(editingItem.image_url)} alt={item.title} className="w-16 h-16 object-cover rounded" />
                                ) : null}
                                <Input id={`item-inline-image-${item.id}`} type="file" accept="image/*" onChange={(e) => setItemImage(e.target.files ? e.target.files[0] : null)} />
                              </div>
                            </TableCell>
                            <TableCell>
                              <Input value={itemTitle} onChange={(e) => setItemTitle(e.target.value)} />
                            </TableCell>
                            <TableCell>
                              <TextArea value={itemDescription} onChange={(v) => setItemDescription(v)} />
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button size="sm" variant="primary" onClick={() => handleSaveInline(item.id)} disabled={rowSaving}>Guardar</Button>
                                <Button size="sm" variant="outline" onClick={cancelInlineEdit}>Cancelar</Button>
                              </div>
                            </TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell>
                              {item.image_url && (
                                <img
                                  src={getAssetUrl(item.image_url)}
                                  alt={item.title}
                                  className="w-16 h-16 object-cover rounded cursor-pointer"
                                  onClick={() => startInlineEdit(item, true)}
                                  title="Click para editar"
                                />
                              )}
                            </TableCell>
                            <TableCell onClick={() => startInlineEdit(item)} className="cursor-pointer">{item.title}</TableCell>
                            <TableCell onClick={() => startInlineEdit(item)} className="cursor-pointer">{item.description}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button size="sm" variant="outline" onClick={() => startInlineEdit(item)}>
                                  Editar
                                </Button>
                                <Button size="sm" variant="danger" onClick={() => handleDelete(item.id)}>
                                  Eliminar
                                </Button>
                              </div>
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </ComponentCard>
        )}
        
      </div>
    </>
  );
};

export default ExtensionSection;