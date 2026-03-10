import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export function Home() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-linear-to-r from-black via-zinc-950 to-blue-900">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>

      {/* Decorative ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />

      <main className="relative z-10 flex flex-col items-center text-center px-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm font-medium">
          <Sparkles className="w-4 h-4" />
          <span>Transforme sua experiência</span>
        </div>

        <p className="text-zinc-400 text-lg md:text-xl max-w-lg mb-2 font-medium">
          Bem-vindo ao início de tudo
        </p>

        <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-linear-to-b from-white to-zinc-400 tracking-tight leading-tight mb-8">
          Extensão do Google Chrome
        </h1>

        <Button
          onClick={() => navigate("/login")}
          size="lg"
          className="group relative h-14 px-8 text-base bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(37,99,235,0.4)]"
        >
          Ir para o Login
          <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
        </Button>
      </main>
    </div>
  );
}
