import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useAuth } from "../../auth/AuthContext";
import { mensagemDeErro } from "../../api/client";
import { PermissoesTab } from "./PermissoesTab";

const TAMANHO_MAX_BYTES = 500 * 1024;

interface PerfilModalProps {
  aberto: boolean;
  aoFechar: () => void;
}

export function PerfilModal({ aberto, aoFechar }: PerfilModalProps) {
  const { usuario, atualizarPerfil, possuiPerfil } = useAuth();
  const inputArquivoRef = useRef<HTMLInputElement>(null);
  const ehAdmin = possuiPerfil("ADMIN");

  const [aba, setAba] = useState<"perfil" | "permissoes">("perfil");
  const [nome, setNome] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    if (aberto) {
      setNome(usuario?.nome ?? "");
      setAvatar(usuario?.avatarBase64 ?? null);
      setErro(null);
      setSucesso(false);
      setAba("perfil");
    }
  }, [aberto, usuario]);

  if (!aberto) return null;

  function aoEscolherArquivo(evento: ChangeEvent<HTMLInputElement>) {
    const arquivo = evento.target.files?.[0];
    if (!arquivo) return;

    if (!arquivo.type.startsWith("image/")) {
      setErro("Selecione um arquivo de imagem.");
      return;
    }
    if (arquivo.size > TAMANHO_MAX_BYTES) {
      setErro("Imagem muito grande. O limite é 500KB.");
      return;
    }

    setErro(null);
    const leitor = new FileReader();
    leitor.onload = () => setAvatar(leitor.result as string);
    leitor.readAsDataURL(arquivo);
  }

  async function aoSubmeter(evento: FormEvent) {
    evento.preventDefault();
    setErro(null);

    if (!nome.trim()) {
      setErro("Informe seu nome.");
      return;
    }

    setSalvando(true);
    try {
      await atualizarPerfil(nome.trim(), avatar);
      setSucesso(true);
      setTimeout(aoFechar, 700);
    } catch (erroRequisicao) {
      setErro(mensagemDeErro(erroRequisicao, "Não foi possível salvar seu perfil."));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm">
      <div className={`w-full rounded-2xl bg-white p-6 shadow-xl transition-all ${ehAdmin ? "max-w-md" : "max-w-sm"}`}>
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold text-slate-800">
              {aba === "perfil" ? "Meu perfil" : "Permissões de usuários"}
            </h2>
            <p className="text-sm text-slate-500">
              {aba === "perfil" ? "Atualize seu nome e sua foto." : "Quem vê o quê no console."}
            </p>
          </div>
          <button
            onClick={aoFechar}
            className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Fechar"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {ehAdmin && (
          <div className="mb-5 flex gap-1 rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setAba("perfil")}
              className={`flex-1 rounded-md py-1.5 text-sm font-medium transition ${
                aba === "perfil" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Meu perfil
            </button>
            <button
              type="button"
              onClick={() => setAba("permissoes")}
              className={`flex-1 rounded-md py-1.5 text-sm font-medium transition ${
                aba === "permissoes" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Permissões
            </button>
          </div>
        )}

        {aba === "permissoes" ? (
          <PermissoesTab />
        ) : (
        <form onSubmit={aoSubmeter} className="space-y-5">
          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => inputArquivoRef.current?.click()}
              className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-slate-200 transition hover:border-brand-400"
            >
              {avatar ? (
                <img src={avatar} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-slate-700 text-2xl font-semibold text-slate-100">
                  {nome?.slice(0, 1).toUpperCase() || "?"}
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/0 text-transparent transition group-hover:bg-slate-900/50 group-hover:text-white">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                  <path
                    d="M4 7h3l2-2h6l2 2h3v12H4V7Z"
                    stroke="currentColor"
                    strokeWidth={1.7}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="12" cy="13" r="3.2" stroke="currentColor" strokeWidth={1.7} />
                </svg>
              </div>
            </button>
            <input
              ref={inputArquivoRef}
              type="file"
              accept="image/*"
              onChange={aoEscolherArquivo}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => inputArquivoRef.current?.click()}
              className="text-xs font-medium text-brand-700 hover:text-brand-800"
            >
              Trocar foto
            </button>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="perfil-nome">
              Nome
            </label>
            <input
              id="perfil-nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">E-mail</label>
            <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-500">{usuario?.email}</p>
          </div>

          {erro && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{erro}</p>}
          {sucesso && <p className="rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-700">Perfil atualizado!</p>}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={aoFechar}
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-60"
            >
              {salvando ? "Salvando…" : "Salvar"}
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}
