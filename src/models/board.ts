export type Label = { id: number; name: string; color: string };
export type Board = {
  id: number;
  number: number;
  title: string;
  body?: string;
  labels: Label[];
  comments: number;
  created_at: string;
  updated_at: string;
  user: { login: string; avatar_url: string };
};

export type FormValue = { title: string; body: string };
