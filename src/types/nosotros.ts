// types/nosotros.ts
export interface Vision {
  imageSrc: string;
  title: string;
  description: string;
}

export interface Mision {
  imageSrc: string;
  title: string;
  description: string;
}

export interface Valores {
  imageSrc: string;
  title: string;
  description: string[];
}

export interface PoliticaIntegral {
  imageSrc: string;
  title: string;
  description: string;
}

export interface NosotrosContent {
  politicaIntegral: PoliticaIntegral;
  objetivoIntegral: string;
  vision: Vision;
  mision: Mision;
  valores: Valores;
  noDiscriminacion: string[][];
}

export type SectionKey = keyof NosotrosContent;

export type ImageSectionKey = 'politicaIntegral' | 'vision' | 'mision' | 'valores';

export interface ApiResponse<T = unknown> {
  message: string;
  content?: T;
  [key: string]: unknown;
}

export interface UpdateSectionRequest {
  [key: string]: unknown;
}