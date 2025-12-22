import { useState, useEffect } from 'react';
import ComponentCard from '../../components/common/ComponentCard';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import { modeloEducativoApi, ModeloEducativo, CaracteristicaModelo } from '../../services/modeloEducativoApi';
import Label from '../../components/form/Label';
import InputField from '../../components/form/input/InputField';
import TextArea from '../../components/form/input/TextArea';
import Button from '../../components/ui/button/Button';

const ModeloEducativoPage = () => {
  const [config, setConfig] = useState<ModeloEducativo>({
    titulo_principal: '',
    descripcion_principal: '',
    titulo_seccion: '',
    descripcion_seccion: '',
    imagen_url: '',
    caracteristicas: [],
    activo: true
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const makeFullUrl = (path?: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const configuredBase = import.meta.env.VITE_API_URL || '';
    if (configuredBase) {
      const base = configuredBase.replace(/\/$/, '');
      const result = encodeURI(`${base}${path.startsWith('/') ? '' : '/'}${path}`);
      console.debug('makeFullUrl -> using configured base', { configuredBase, path, result });
      return result;
    }
    // No configured API host -> return relative path so Vite proxy can handle /uploads in dev
    const relative = path.startsWith('/') ? path : `/${path}`;
    const result = encodeURI(relative);
    console.debug('makeFullUrl -> using relative path for proxy', { path, result });
    return result;
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const data = await modeloEducativoApi.get();
      setConfig(data);
    } catch (error) {
      console.error('Error al cargar modelo educativo:', error);
      setMessage('❌ Error al cargar la información');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config.id) return;

    setSaving(true);
    setMessage('');

    try {
      const payload = selectedImageFile ? { ...(config as any), imagenFile: selectedImageFile } : config;
      const updated = await modeloEducativoApi.update(config.id, payload as any);
      setConfig(updated);
      setSelectedImageFile(null);
      setPreviewUrl('');
      setMessage('✅ Información actualizada exitosamente');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error al guardar:', error);
      setMessage('❌ Error al guardar la información');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof ModeloEducativo, value: string | boolean) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFeatureChange = (index: number, field: keyof CaracteristicaModelo, value: string | number) => {
    const newFeatures = [...config.caracteristicas];
    newFeatures[index] = {
      ...newFeatures[index],
      [field]: value
    };
    setConfig(prev => ({
      ...prev,
      caracteristicas: newFeatures
    }));
  };

  if (loading) {
    return <div className="p-6">Cargando...</div>;
  }

  return (
    <>
      <PageMeta title="Gestión de Modelos Educativos | UTTECAM" description="Administración de la sección de modelos educativos" />
      <PageBreadcrumb pageTitle="Gestión de Modelos Educativos" />
      
      <div className="grid grid-cols-1 gap-6">
        <ComponentCard title="Información General">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="titulo_principal">Título Principal</Label>
                <InputField
                  type="text"
                  id="titulo_principal"
                  value={config.titulo_principal}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('titulo_principal', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="titulo_seccion">Título de Sección</Label>
                <InputField
                  type="text"
                  id="titulo_seccion"
                  value={config.titulo_seccion}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('titulo_seccion', e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="descripcion_principal">Descripción Principal</Label>
              <TextArea
                id="descripcion_principal"
                value={config.descripcion_principal}
                onChange={(value: string) => handleInputChange('descripcion_principal', value)}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="descripcion_seccion">Descripción de Sección</Label>
              <TextArea
                id="descripcion_seccion"
                value={config.descripcion_seccion}
                onChange={(value: string) => handleInputChange('descripcion_seccion', value)}
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="imagen_file">Imagen</Label>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept="image/*"
                  id="imagen_file"
                  onChange={(e) => {
                    const file = e.target.files && e.target.files[0];
                    if (file) {
                      setSelectedImageFile(file);
                      setPreviewUrl(URL.createObjectURL(file));
                    } else {
                      setSelectedImageFile(null);
                      setPreviewUrl('');
                    }
                  }}
                />
                {selectedImageFile && (
                  <button type="button" className="px-3 py-1 bg-red-50 text-red-800 rounded" onClick={() => { setSelectedImageFile(null); setPreviewUrl(''); (document.getElementById('imagen_file') as HTMLInputElement).value = ''; }}>
                    Quitar
                  </button>
                )}
              </div>
              {(config.imagen_url || previewUrl) && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500 mb-1">Imagen actual:</p>
                  <button 
                    type="button" 
                    aria-label="Ampliar imagen"
                    className="block cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => {
                      console.debug('ModeloEducativo: abrir preview', { url: previewUrl || makeFullUrl(config.imagen_url) })
                      setPreviewUrl(previewUrl || makeFullUrl(config.imagen_url))
                    }}
                  >
                    <img
                      src={previewUrl || makeFullUrl(config.imagen_url)}
                      alt="Preview"
                      className="h-40 object-cover rounded-lg border cursor-pointer"
                      onClick={() => {
                        console.debug('Imagen clickeada (img element)')
                        setPreviewUrl(previewUrl || makeFullUrl(config.imagen_url))
                      }}
                      onError={(e) => {
                        // keep element visible but show fallback border to indicate load issue
                        e.currentTarget.style.opacity = '0.6'
                      }}
                    />
                  </button>
                  <p className="text-xs text-gray-400 mt-1">Haz clic para ampliar</p>
                </div>
              )}
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Características</h3>
              <div className="space-y-6">
                {config.caracteristicas.map((feature, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium">Característica #{feature.number}</h4>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label>Título</Label>
                        <InputField
                          type="text"
                          value={feature.title}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFeatureChange(index, 'title', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Descripción</Label>
                        <TextArea
                          value={feature.description}
                          onChange={(value: string) => handleFeatureChange(index, 'description', value)}
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <div className="text-green-600 font-medium">{message}</div>
              <Button type="submit" disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </form>
        </ComponentCard>
        {previewUrl && (
          <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black bg-opacity-60" onClick={() => setPreviewUrl('')}>
            <div className="relative max-w-4xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <button className="absolute -top-3 -right-3 bg-white rounded-full p-1 shadow" onClick={() => setPreviewUrl('')} aria-label="Cerrar previsualización">✕</button>
              <div className="bg-white rounded overflow-hidden p-4 max-h-[80vh] overflow-auto">
                <img src={previewUrl} className="w-full object-contain" alt="Preview" />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ModeloEducativoPage;
