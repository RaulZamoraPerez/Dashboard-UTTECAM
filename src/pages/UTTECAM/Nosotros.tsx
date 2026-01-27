import { useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { useNosotros } from "../../hooks/useNosotros";
import { SectionKey, ImageSectionKey } from "../../types/nosotros";
import ImageTextSection from "../../components/nosotros/ImageTextSection";
import SimpleTextSection from "../../components/nosotros/SimpleTextSection";
import ValuesSection from "../../components/nosotros/ValuesSection";
import NoDiscriminacionSection from "../../components/nosotros/NoDiscriminacionSection";

export default function Nosotros() {
  const { content, loading, error, updateSection, uploadImage } = useNosotros();
  const [editingSection, setEditingSection] = useState<SectionKey | null>(null);

  if (loading) return <div className="p-6 text-center">Cargando información...</div>;
  if (error) return <div className="p-6 text-center text-red-500">Error: {error}</div>;
  if (!content) return <div className="p-6 text-center">No hay información disponible.</div>;

  const handleSaveImageSection = async (
    key: ImageSectionKey,
    currentData: any,
    description: string,
    file: File | null
  ) => {
    try {
      // 1. Update text
      // Note: updateSection expects (sectionKey, dataObject)
      // For 'vision', dataObject should be { description: '...', imageSrc: '...' }
      // But wait, updateSection wraps it in { [key]: data }
      // So we pass the inner object.
      const successText = await updateSection(key, { ...currentData, description: description });

      // 2. Upload image if present
      if (file && successText) {
        await uploadImage(key, file);
      }

      setEditingSection(null);
    } catch (err) {
      console.error("Error saving section:", err);
    }
  };

  return (
    <>
      <PageMeta
        title="Nosotros - Administración"
        description="Administración de la sección Nosotros"
      />
      <PageBreadcrumb pageTitle="Nosotros" />

      <div className="space-y-6">
        {/* Política Integral */}
        <ImageTextSection
          title="Política Integral"
          sectionKey="politicaIntegral"
          data={{
            description: content.politicaIntegral?.description || '',
            imageSrc: content.politicaIntegral?.imageSrc || ''
          }}
          isEditing={editingSection === 'politicaIntegral'}
          onEdit={() => setEditingSection('politicaIntegral')}
          onCancel={() => setEditingSection(null)}
          onSave={(desc, file) => handleSaveImageSection('politicaIntegral', content.politicaIntegral, desc, file)}
        />

        {/* Objetivo Integral */}
        <SimpleTextSection
          title="Objetivo Integral"
          description={content.objetivoIntegral || ''}
          isEditing={editingSection === 'objetivoIntegral'}
          onEdit={() => setEditingSection('objetivoIntegral')}
          onCancel={() => setEditingSection(null)}
          onSave={async (desc) => {
            // For simple text fields like objetivoIntegral, the API expects { objetivoIntegral: "text" }
            // updateSection wraps it in { [key]: data }
            // So if we pass 'objetivoIntegral' and "text", it sends { objetivoIntegral: "text" } ?
            // No, updateSection sends { [section]: data }.
            // If section is 'objetivoIntegral', and data is "text", it sends { objetivoIntegral: "text" }.
            // But wait, UpdateSectionRequest is { [key: string]: unknown }.
            // So passing a string is valid.
            await updateSection('objetivoIntegral', desc as any);
            setEditingSection(null);
          }}
        />

        {/* Visión */}
        <ImageTextSection
          title="Visión"
          sectionKey="vision"
          data={{
            description: content.vision?.description || '',
            imageSrc: content.vision?.imageSrc || ''
          }}
          isEditing={editingSection === 'vision'}
          onEdit={() => setEditingSection('vision')}
          onCancel={() => setEditingSection(null)}
          onSave={(desc, file) => handleSaveImageSection('vision', content.vision, desc, file)}
        />

        {/* Misión */}
        <ImageTextSection
          title="Misión"
          sectionKey="mision"
          data={{
            description: content.mision?.description || '',
            imageSrc: content.mision?.imageSrc || ''
          }}
          isEditing={editingSection === 'mision'}
          onEdit={() => setEditingSection('mision')}
          onCancel={() => setEditingSection(null)}
          onSave={(desc, file) => handleSaveImageSection('mision', content.mision, desc, file)}
        />

        {/* Valores */}
        <ValuesSection
          title="Valores"
          data={content.valores || { imageSrc: '', description: [] }}
          isEditing={editingSection === 'valores'}
          onEdit={() => setEditingSection('valores')}
          onCancel={() => setEditingSection(null)}
          onSave={async (data, file) => {
            const success = await updateSection('valores', data);
            if (file && success) {
              await uploadImage('valores', file);
            }
            setEditingSection(null);
          }}
        />

        {/* No Discriminación */}
        <NoDiscriminacionSection
          title="No Discriminación"
          data={content.noDiscriminacion || [[], [], []]}
          isEditing={editingSection === 'noDiscriminacion'}
          onEdit={() => setEditingSection('noDiscriminacion')}
          onCancel={() => setEditingSection(null)}
          onSave={async (data) => {
            // data is string[][]
            await updateSection('noDiscriminacion', data as any);
            setEditingSection(null);
          }}
        />
      </div>
    </>
  );
}
