// types/nosotros.ts
export interface Vision {
  title: string;
  description: string;
}

export interface Mision {
  title: string;
  description: string;
}

export interface Valores {
  title: string;
  description: string[];
}

export interface PoliticaIntegral {
  imageSrc: string | null;
  text: string;
}

export interface ObjetivoIntegral {
  text: string;
}

export interface NoDiscriminacion {
  items: string[];
}

export interface Organigrama {
  imageSrc: string | null;
}

export interface NosotrosContent {
  vision: Vision;
  mision: Mision;
  valores: Valores;
  politicaIntegral: PoliticaIntegral;
  objetivoIntegral: ObjetivoIntegral;
  noDiscriminacion: NoDiscriminacion;
  organigrama: Organigrama;
}

export type SectionKey = keyof NosotrosContent;

export type ImageSectionKey = 'politicaIntegral' | 'organigrama';

export interface ApiResponse<T = unknown> {
  message: string;
  content?: T;
  [key: string]: unknown;
}

export interface UpdateSectionRequest {
  [key: string]: unknown;
}
