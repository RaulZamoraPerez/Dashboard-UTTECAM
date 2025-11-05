import { useState, useEffect } from 'react';
import ComponentCard from '../../components/common/ComponentCard';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import { relojDigitalApi, RelojDigital } from '../../services/relojDigitalApi';

const zonasHorarias = [
  { value: 'America/Mexico_City', label: 'Ciudad de México (CST/CDT)' },
  { value: 'America/Tijuana', label: 'Tijuana (PST/PDT)' },
  { value: 'America/Cancun', label: 'Cancún (EST/EDT)' },
  { value: 'UTC', label: 'Tiempo Universal (UTC)' },
];

const RelojDigitalAdmin = () => {
  const [config, setConfig] = useState<RelojDigital>({
    zonaHoraria: 'America/Mexico_City',
    formato24Horas: true,
    mostrarFecha: true,
    mostrarDiaSemana: true,
    activo: true,
    estilo: 'digital'
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [horaActual, setHoraActual] = useState(new Date());
  const [relojId, setRelojId] = useState<number | null>(null);

  // Actualizar hora cada segundo para preview
  useEffect(() => {
    const timer = setInterval(() => {
      setHoraActual(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Cargar configuración existente al montar el componente
  useEffect(() => {
    loadRelojConfig();
  }, []);

  const loadRelojConfig = async () => {
    try {
      const relojData = await relojDigitalApi.getActive();
      setConfig(relojData);
      setRelojId(relojData.id || null);
    } catch (error) {
      console.error('Error al cargar configuración del reloj:', error);
      // Si no hay configuración, mantener valores por defecto
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      if (relojId) {
        // Actualizar configuración existente
        await relojDigitalApi.update(relojId, config);
        setMessage('✅ Configuración actualizada exitosamente');
      } else {
        // Crear nueva configuración
        const newReloj = await relojDigitalApi.create(config);
        setRelojId(newReloj.id || null);
        setMessage('✅ Configuración del reloj creada exitosamente');
      }

      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error al guardar configuración:', error);
      setMessage('❌ Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof RelojDigital, value: string | boolean) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-MX', {
      hour12: !config.formato24Horas,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: config.zonaHoraria
    });
  };

  const formatDate = (date: Date) => {
    if (!config.mostrarFecha) return '';

    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };

    if (config.mostrarDiaSemana) {
      options.weekday = 'long';
    }

    return date.toLocaleDateString('es-MX', options);
  };

  return (
    <>
      <PageMeta
        title="Reloj Digital | Dashboard UTTECAM"
        description="Configurar el reloj digital de la página de inicio"
      />
      <PageBreadcrumb pageTitle="Reloj Digital" />

      <div className="space-y-6">
        <ComponentCard title="Configuración del Reloj Digital">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zona Horaria
                  </label>
                  <select
                    value={config.zonaHoraria}
                    onChange={(e) => handleInputChange('zonaHoraria', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {zonasHorarias.map(zona => (
                      <option key={zona.value} value={zona.value}>
                        {zona.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estilo del Reloj
                  </label>
                  <select
                    value={config.estilo}
                    onChange={(e) => handleInputChange('estilo', e.target.value as 'digital' | 'analogico')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="digital">Digital</option>
                    <option value="analogico">Analógico</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="formato24"
                      checked={config.formato24Horas}
                      onChange={(e) => handleInputChange('formato24Horas', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="formato24" className="ml-2 block text-sm text-gray-900">
                      Formato 24 horas
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="mostrarFecha"
                      checked={config.mostrarFecha}
                      onChange={(e) => handleInputChange('mostrarFecha', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="mostrarFecha" className="ml-2 block text-sm text-gray-900">
                      Mostrar fecha
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="mostrarDia"
                      checked={config.mostrarDiaSemana}
                      onChange={(e) => handleInputChange('mostrarDiaSemana', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="mostrarDia" className="ml-2 block text-sm text-gray-900">
                      Mostrar día de la semana
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="activoReloj"
                      checked={config.activo}
                      onChange={(e) => handleInputChange('activo', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="activoReloj" className="ml-2 block text-sm text-gray-900">
                      Reloj activo en la página de inicio
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-4">Vista Previa del Reloj</h4>
                  <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg p-6 text-white shadow-lg">
                    <div className="text-center">
                      <div className="text-4xl font-mono font-bold mb-2">
                        {formatTime(horaActual)}
                      </div>
                      {config.mostrarFecha && (
                        <div className="text-lg opacity-90 capitalize">
                          {formatDate(horaActual)}
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Vista previa en tiempo real
                  </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Información</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• El reloj se actualiza automáticamente</li>
                    <li>• Aparece en la página de inicio junto al video</li>
                    <li>• Configurable por zona horaria</li>
                    <li>• Formatos 12/24 horas disponibles</li>
                  </ul>
                </div>
              </div>
            </div>

            {message && (
              <div className={`p-4 rounded-md ${message.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                {message}
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Guardando...' : 'Guardar Configuración'}
              </button>
            </div>
          </form>
        </ComponentCard>
      </div>
    </>
  );
};

export default RelojDigitalAdmin;