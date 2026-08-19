import type { UsuarioAutenticado } from "../types";

const CHAVE_ACCESS = "suporte.accessToken";
const CHAVE_REFRESH = "suporte.refreshToken";
const CHAVE_USUARIO = "suporte.usuario";

export const tokenStorage = {
  getAccessToken(): string | null {
    return localStorage.getItem(CHAVE_ACCESS);
  },
  getRefreshToken(): string | null {
    return localStorage.getItem(CHAVE_REFRESH);
  },
  getUsuario(): UsuarioAutenticado | null {
    const bruto = localStorage.getItem(CHAVE_USUARIO);
    return bruto ? (JSON.parse(bruto) as UsuarioAutenticado) : null;
  },
  salvar(accessToken: string, refreshToken: string, usuario: UsuarioAutenticado) {
    localStorage.setItem(CHAVE_ACCESS, accessToken);
    localStorage.setItem(CHAVE_REFRESH, refreshToken);
    localStorage.setItem(CHAVE_USUARIO, JSON.stringify(usuario));
  },
  atualizarTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem(CHAVE_ACCESS, accessToken);
    localStorage.setItem(CHAVE_REFRESH, refreshToken);
  },
  atualizarUsuario(usuario: UsuarioAutenticado) {
    localStorage.setItem(CHAVE_USUARIO, JSON.stringify(usuario));
  },
  limpar() {
    localStorage.removeItem(CHAVE_ACCESS);
    localStorage.removeItem(CHAVE_REFRESH);
    localStorage.removeItem(CHAVE_USUARIO);
  },
};
