// types/organigrama.ts

export interface Organigrama {
  id: number;
  key?: string;
  parent_id?: number;
  expanded?: boolean;
  type: string;
  image?: string;
  name: string;
  title: string;
  text?: string;
  order_position?: number;
}

export interface OrganigramaFormData {
  key?: string;
  parent_id?: number;
  expanded?: boolean;
  type: string;
  image?: File | null;
  name: string;
  title: string;
  text?: string;
  order_position?: number;
}

export interface CreateOrganigramaRequest {
  key?: string;
  parent_id?: number;
  expanded?: boolean;
  type: string;
  name: string;
  title: string;
  text?: string;
  order_position?: number;
}

export interface UpdateOrganigramaRequest extends CreateOrganigramaRequest {
  id: number;
}

export interface OrganigramaNode {
  key?: string;
  expanded?: boolean;
  type?: string;
  data: {
    image: string;
    name: string;
    title: string;
    text?: string;
  };
  children?: OrganigramaNode[];
}
