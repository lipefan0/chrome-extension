import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Loader2, Link as LinkIcon, RefreshCw, LogOut } from "lucide-react";
import { SalesList } from "../components/SalesList";
import { storage } from "../lib/storage";

interface UserInfo {
  name: string;
  email: string;
  hasBlingConnection: boolean;
}

export function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [connecting, setConnecting] = useState(false);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const token = await storage.get("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        if (response.status === 401) {
          await storage.remove("token");
          navigate("/login");
          return;
        }
        throw new Error("Falha ao carregar informações do usuário.");
      }

      const data = await response.json();
      setUser(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleConnectBling = async () => {
    try {
      setConnecting(true);
      setError("");

      const token = await storage.get("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/bling/auth/link`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Erro ao gerar link de conexão com Bling.");
      }

      const data = await response.json();
      if (data.authorization_url) {
        // Open the authorization link in a new tab
        window.open(data.authorization_url, "_blank");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setConnecting(false);
    }
  };

  const logout = async () => {
    await storage.remove("token");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-zinc-950 text-white relative">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        <p className="mt-4 text-zinc-400 animate-pulse">Carregando dados...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-zinc-950 text-white p-6">
        <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl max-w-md w-full text-center">
          <p className="text-red-400 font-medium">{error}</p>
          <Button
            onClick={loadProfile}
            variant="outline"
            className="mt-6 border-red-500/50 text-red-400 hover:bg-red-500/20"
          >
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen w-full flex flex-col bg-zinc-950 text-white relative">
      <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-blue-600 to-indigo-600" />

      <header className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white to-zinc-400">
            Painel da Extensão
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5">Olá, {user.name}</p>
        </div>
        <Button
          onClick={logout}
          variant="ghost"
          size="icon"
          className="text-zinc-400 hover:text-white hover:bg-zinc-800"
        >
          <LogOut className="w-5 h-5" />
        </Button>
      </header>

      <main className="flex-1 p-6 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-2xl mb-12">
          {user.hasBlingConnection ? (
            <SalesList />
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl animate-in fade-in zoom-in slide-in-from-bottom-4 duration-700">
              <div className="mb-8 text-center">
                <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6 ring-2 ring-blue-500/20">
                  <LinkIcon className="w-8 h-8 text-blue-500" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Integração Necessária
                </h2>
                <p className="text-zinc-400">
                  Você ainda não está conectado com o Bling. Para utilizar a
                  extensão, realize a autenticação.
                </p>
              </div>

              <div className="space-y-4">
                <Button
                  onClick={handleConnectBling}
                  disabled={connecting}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-medium text-base transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_25px_rgba(37,99,235,0.4)]"
                >
                  {connecting ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    "Conectar com Bling"
                  )}
                </Button>

                <div className="pt-4 border-t border-zinc-800 mt-4 text-center">
                  <p className="text-sm text-zinc-500 mb-4">
                    Já fez a autenticação na outra aba?
                  </p>
                  <Button
                    onClick={loadProfile}
                    variant="ghost"
                    className="w-full text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-800"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Atualizar Informações
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
