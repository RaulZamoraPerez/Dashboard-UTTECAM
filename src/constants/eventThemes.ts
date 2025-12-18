export interface EventTheme {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
}

export const eventThemes: EventTheme[] = [
  {
    id: 'dorado-clasico',
    name: 'Dorado Clásico',
    description: 'Elegante y formal, ideal para eventos institucionales',
    color: '#FFD700',
    icon: '⭐'
  },
  {
    id: 'rojo-deportivo',
    name: 'Rojo Deportivo',
    description: 'Energético y dinámico, perfecto para eventos deportivos',
    color: '#E74C3C',
    icon: '⚽'
  },
  {
    id: 'azul-academico',
    name: 'Azul Académico',
    description: 'Profesional y confiable, ideal para conferencias y seminarios',
    color: '#3498DB',
    icon: '📚'
  },
  {
    id: 'morado-cultural',
    name: 'Morado Cultural',
    description: 'Creativo y artístico, perfecto para eventos culturales',
    color: '#9B59B6',
    icon: '🎭'
  },
  {
    id: 'verde-ambiental',
    name: 'Verde Ambiental',
    description: 'Fresco y natural, ideal para eventos ecológicos',
    color: '#27AE60',
    icon: '🌿'
  },
  {
    id: 'naranja-innovacion',
    name: 'Naranja Innovación',
    description: 'Moderno y vibrante, perfecto para tecnología y startups',
    color: '#E67E22',
    icon: '💡'
  },
  {
    id: 'rosa-social',
    name: 'Rosa Social',
    description: 'Cálido y acogedor, ideal para eventos sociales y comunitarios',
    color: '#E91E63',
    icon: '🎉'
  },
  {
    id: 'turquesa-cientifico',
    name: 'Turquesa Científico',
    description: 'Innovador y tecnológico, perfecto para ciencia y tecnología',
    color: '#00BCD4',
    icon: '🔬'
  },
  {
    id: 'granate-graduacion',
    name: 'Granate Graduación',
    description: 'Solemne y ceremonial, ideal para graduaciones y ceremonias',
    color: '#8B0000',
    icon: '🎓'
  },
  {
    id: 'amarillo-alegre',
    name: 'Amarillo Alegre',
    description: 'Brillante y optimista, perfecto para festivales y celebraciones',
    color: '#F1C40F',
    icon: '☀️'
  },
  {
    id: 'indigo-noche',
    name: 'Índigo Nocturno',
    description: 'Elegante y misterioso, ideal para eventos nocturnos',
    color: '#3F51B5',
    icon: '🌙'
  },
  {
    id: 'coral-verano',
    name: 'Coral Verano',
    description: 'Fresco y tropical, perfecto para eventos de verano',
    color: '#FF6B6B',
    icon: '🏖️'
  }
];

export const getThemeByColor = (color: string): EventTheme | undefined => {
  return eventThemes.find(theme => theme.color.toLowerCase() === color.toLowerCase());
};

export const getThemeById = (id: string): EventTheme | undefined => {
  return eventThemes.find(theme => theme.id === id);
};
