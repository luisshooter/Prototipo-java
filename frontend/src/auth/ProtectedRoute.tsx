import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  /** Permissao fina exigida, alem de estar logado. ADMIN sempre passa. */
  exigirPermissao?: "dashboard" | "criarChamado";
}

export function ProtectedRoute({ children, exigirPermissao }: ProtectedRouteProps) {
  const { usuario, possuiPerfil } = useAuth();
  const location = useLocation();

  if (!usuario) {
    return <Navigate to="/login" replace state={{ de: location.pathname }} />;
  }

  const ehAdmin = possuiPerfil("ADMIN");
  const permissaoOk =
    !exigirPermissao ||
    ehAdmin ||
    (exigirPermissao === "dashboard" && usuario.podeVerDashboard) ||
    (exigirPermissao === "criarChamado" && usuario.podeCriarChamado);

  if (!permissaoOk) {
    return <Navigate to="/receitas" replace />;
  }

  return <>{children}</>;
}
