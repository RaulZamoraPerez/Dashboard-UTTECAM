// types/nosotros.ts
export interface Vision {
  title?: string;
  description: string;
  imageSrc: string | null;
}

export interface Mision {
  title?: string;
  description: string;
  imageSrc: string | null;
}

export interface Valores {
  imageSrc: string | null;
  title?: string;
  description: string[];
}

export interface PoliticaIntegral {
  imageSrc: string | null;
  description: string;
}

export interface ObjetivoIntegral {
  text: string;
}

export type NoDiscriminacion = string[][];

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

export type ImageSectionKey = 'politicaIntegral' | 'vision' | 'mision' | 'valores' | 'organigrama';

export interface ApiResponse<T = unknown> {
  message: string;
  content?: T;
  [key: string]: unknown;
}

export interface UpdateSectionRequest {
  [key: string]: unknown;
}
