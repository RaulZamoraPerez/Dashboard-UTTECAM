import { Edit, Mail, Phone, ExternalLink } from 'lucide-react';

interface FooterLink {
    id: string;
    text: string;
    url: string;
}

interface FooterData {
    title: string;
    subtitle: string;
    email: string;
    phone: string;
    links: FooterLink[];
}

interface FooterSectionProps {
    id: number;
    data: FooterData;
    onEdit: () => void;
}

export const FooterSection = ({ data, onEdit }: FooterSectionProps) => {
    // Default values if data is missing
    const content = {
        title: data?.title || '¿Tienes dudas?',
        subtitle: data?.subtitle || 'Estamos aquí para ayudarte en tu proceso',
        email: data?.email || 'serviciosestudiantiles@uttecam.edu.mx',
        phone: data?.phone || '249 422 3300 Ext. 161',
        links: data?.links || []
    };

    return (
        <div className="relative group/section bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-12 text-center shadow-sm border border-gray-100 dark:border-gray-700">
            {/* Edit Button */}
            <button
                onClick={onEdit}
                className="absolute top-4 right-4 z-10 p-2 bg-white dark:bg-gray-700 rounded-full shadow-md border border-gray-200 dark:border-gray-600 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 opacity-0 group-hover/section:opacity-100 transition-all duration-200"
                title="Editar pie de página"
            >
                <Edit size={16} />
            </button>

            {/* Header */}
            <h2 className="text-2xl md:text-3xl font-bold text-[#0a9782] dark:text-[#0ebda2] mb-3">
                {content.title}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
                {content.subtitle}
            </p>

            {/* Contact Buttons */}
            <div className="flex flex-col md:flex-row justify-center gap-4 md:gap-8 mb-10">
                {content.email && (
                    <a
                        href={`mailto:${content.email}`}
                        className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full text-gray-700 dark:text-gray-200 hover:shadow-md hover:border-[#0a9782] dark:hover:border-[#0ebda2] hover:text-[#0a9782] dark:hover:text-[#0ebda2] transition-all duration-300 group"
                    >
                        <Mail className="text-gray-400 group-hover:text-[#0a9782] dark:group-hover:text-[#0ebda2] transition-colors" size={20} />
                        <span className="font-semibold">{content.email}</span>
                    </a>
                )}

                {content.phone && (
                    <a
                        href={`tel:${content.phone.replace(/[^0-9]/g, '')}`}
                        className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full text-gray-700 dark:text-gray-200 hover:shadow-md hover:border-[#0a9782] dark:hover:border-[#0ebda2] hover:text-[#0a9782] dark:hover:text-[#0ebda2] transition-all duration-300 group"
                    >
                        <Phone className="text-gray-400 group-hover:text-[#0a9782] dark:group-hover:text-[#0ebda2] transition-colors" size={20} />
                        <span className="font-semibold">{content.phone}</span>
                    </a>
                )}
            </div>

            {/* Links */}
            {content.links.length > 0 && (
                <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
                    {content.links.map((link) => (
                        <a
                            key={link.id}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-[#0a9782] dark:hover:text-[#0ebda2] transition-colors text-sm font-medium flex items-center gap-1"
                        >
                            {link.text}
                            <ExternalLink size={12} />
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
};
