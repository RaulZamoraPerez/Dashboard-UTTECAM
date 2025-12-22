export type BecaItem = {
  id: string;
  title: string;
  description?: string;
};

export type Seccion = {
  id: string;
  title: string;
  description?: string;
  items: BecaItem[];
};
