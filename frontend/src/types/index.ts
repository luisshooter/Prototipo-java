export interface Cliente {
  id: number;
  nome: string;
}

export interface Modulo {
  id: number;
  nome: string;
}

export interface Ticket {
  codigo: number;
  titulo: string;
  cliente: string;
  dataAbertura: string;
  dataEncerramento: string | null;
  modulo: string;
}

export interface Agrupamento {
  nome: string;
  quantidade: number;
}

export interface DashboardData {
  tickets: Ticket[];
  porCliente: Agrupamento[];
  porModulo: Agrupamento[];
}

export interface NovoTicketPayload {
  titulo: string;
  codCliente: number;
  codModulo: number;
  dataAbertura: string;
  dataEncerramento?: string | null;
}

export interface Receita {
  publisher: string;
  title: string;
  sourceUrl: string;
  recipeId: string;
  imageUrl: string;
  socialRank: number;
  publisherUrl: string;
}

export interface ReceitaResponse {
  count: number;
  receitas: Receita[];
}

export type Perfil = "ADMIN" | "USER";

export interface UsuarioAutenticado {
  nome: string;
  email: string;
  perfis: Perfil[];
  avatarBase64: string | null;
  podeVerDashboard: boolean;
  podeCriarChamado: boolean;
}

export interface UsuarioAdmin {
  id: number;
  nome: string;
  email: string;
  perfis: Perfil[];
  podeVerDashboard: boolean;
  podeCriarChamado: boolean;
}

export interface ApiErrorBody {
  status: number;
  error: string;
  message: string;
  path: string;
  detalhes?: string[];
}
