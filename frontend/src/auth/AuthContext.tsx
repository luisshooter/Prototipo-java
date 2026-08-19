import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import * as authApi from "../api/auth";
import { EVENTO_SESSAO_ENCERRADA } from "../api/client";
import { tokenStorage } from "./tokenStorage";
import type { Perfil, UsuarioAutenticado } from "../types";

interface AuthContextValue {
  usuario: UsuarioAutenticado | null;
  carregando: boolean;
  entrar: (email: string, senha: string) => Promise<void>;
  sair: () => Promise<void>;
  possuiPerfil: (perfil: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioAutenticado | null>(() => tokenStorage.getUsuario());
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    function aoEncerrarSessao() {
      setUsuario(null);
    }

    window.addEventListener(EVENTO_SESSAO_ENCERRADA, aoEncerrarSessao);
    return () => window.removeEventListener(EVENTO_SESSAO_ENCERRADA, aoEncerrarSessao);
  }, []);

  async function entrar(email: string, senha: string) {
    setCarregando(true);
    try {
      const resposta = await authApi.login(email, senha);
      tokenStorage.salvar(resposta.accessToken, resposta.refreshToken, resposta.usuario);
      setUsuario(resposta.usuario);
    } finally {
      setCarregando(false);
    }
  }

  async function sair() {
    const refreshToken = tokenStorage.getRefreshToken();
    tokenStorage.limpar();
    setUsuario(null);
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch {
        // logout e best-effort: a sessao local ja foi encerrada de qualquer forma
      }
    }
  }

  function possuiPerfil(perfil: string) {
    return usuario?.perfis.includes(perfil as Perfil) ?? false;
  }

  const value = useMemo(
    () => ({ usuario, carregando, entrar, sair, possuiPerfil }),
    [usuario, carregando]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth precisa ser usado dentro de um AuthProvider");
  }
  return context;
}
