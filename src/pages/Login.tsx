import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { storage } from "../lib/storage";

const loginSchema = z.object({
  email: z.string().email("E-mail inválido."),
  password: z.string().min(1, "A senha é obrigatória."),
});

type LoginSchema = z.infer<typeof loginSchema>;

export function Login() {
  const navigate = useNavigate();
  const [errorLine, setErrorLine] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "desenvolvimento@contis.com.br",
      password: "",
    },
  });

  const onSubmit = async (data: LoginSchema) => {
    try {
      setLoading(true);
      setErrorLine("");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        },
      );

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Erro ao fazer login");
      }

      // Successfully authenticated
      await storage.set("token", responseData.token);
      alert("Login bem sucedido!");

      // Optionally navigate to dashboard/home
      navigate("/dashboard");
    } catch (err: any) {
      setErrorLine(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-zinc-950 text-white relative">
      <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-blue-600 to-indigo-600" />

      <div className="w-full max-w-md p-8 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl animate-in fade-in zoom-in-95 duration-500">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold mb-2">Login</h2>
          <p className="text-zinc-400 text-sm">Acesse o painel da extensão</p>
        </div>

        {errorLine && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            {errorLine}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">E-mail</label>
            <input
              type="email"
              {...register("email")}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white placeholder-zinc-600"
              placeholder="seu@email.com"
            />
            {errors.email && (
              <p className="text-xs text-red-400">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Senha</label>
            <input
              type="password"
              {...register("password")}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white placeholder-zinc-600"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-xs text-red-400">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-6 font-semibold bg-white text-black hover:bg-zinc-200 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              "Entrar"
            )}
          </Button>
        </form>

        <div className="mt-8 flex justify-center">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Início
          </Button>
        </div>
      </div>
    </div>
  );
}
