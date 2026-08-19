import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { tokenStorage } from "../auth/tokenStorage";

// Nenhuma URL de API fica fixa no código: vem de configuração de ambiente (VITE_API_URL).
const baseURL = import.meta.env.VITE_API_URL;

export const api = axios.create({ baseURL });

// instancia separada, sem interceptores, para nao entrar em loop ao renovar a sessao
const semInterceptor = axios.create({ baseURL });

export const EVENTO_SESSAO_ENCERRADA = "suporte:sessao-encerrada";

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStorage.getAccessToken();
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

let renovacaoEmAndamento: Promise<string | null> | null = null;

async function renovarSessao(): Promise<string | null> {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) return null;

  try {
    const { data } = await semInterceptor.post("/api/auth/refresh", { refreshToken });
    tokenStorage.atualizarTokens(data.accessToken, data.refreshToken);
    return data.accessToken as string;
  } catch {
    return null;
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const isLoginOuRefresh = original?.url?.includes("/api/auth/login") || original?.url?.includes("/api/auth/refresh");

    if (error.response?.status === 401 && original && !original._retry && !isLoginOuRefresh) {
      original._retry = true;

      if (!renovacaoEmAndamento) {
        renovacaoEmAndamento = renovarSessao().finally(() => {
          renovacaoEmAndamento = null;
        });
      }

      const novoToken = await renovacaoEmAndamento;
      if (novoToken) {
        original.headers.set("Authorization", `Bearer ${novoToken}`);
        return api.request(original);
      }

      tokenStorage.limpar();
      window.dispatchEvent(new Event(EVENTO_SESSAO_ENCERRADA));
    }

    return Promise.reject(error);
  }
);

/** Extrai uma mensagem legivel do corpo de erro padronizado da API. */
export function mensagemDeErro(error: unknown, padrao = "Ocorreu um erro inesperado. Tente novamente."): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return "Nao foi possivel conectar ao servidor. Verifique sua conexao e tente novamente.";
    }
    const corpo = error.response.data as { message?: string; detalhes?: string[] } | undefined;
    if (corpo?.detalhes?.length) {
      return corpo.detalhes.join(" ");
    }
    if (corpo?.message) {
      return corpo.message;
    }
  }
  return padrao;
}
