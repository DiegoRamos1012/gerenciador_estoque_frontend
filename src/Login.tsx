import { useState } from "react";
import type { FormEvent } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import { Field, FieldLabel } from "./components/ui/field";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import type { User } from "./utils/interfaces";
import { login } from "./services/authService";
import { AxiosError } from "axios";

export default function Login({ onAuth }: { onAuth?: (user: User) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    if (!email.trim() || !password) {
      toast.error("Preencha email e senha");
      setLoading(false);
      return;
    }

    try {
      const { user } = await login({ email, password });
      toast.success(`Bem-vindo, ${user.name}!`);
      onAuth?.(user);
    } catch (err) {
      if (err instanceof AxiosError) {
        const msg =
          err.response?.data?.message ??
          err.response?.data?.error ??
          "Email ou senha inválidos";
        toast.error(msg);
      } else {
        toast.error("Erro ao conectar com o servidor");
      }
    } finally {
      setLoading(false);
    }
  }

  function setUserAdmin() {
    setEmail("testeadmin@email.com");
    setPassword("A1b2c3d4-");
  }

  return (
    <div
      className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/img/background-stock-employee.webp')" }}
    >
      <div className="w-full max-w-md">
        <div className="backdrop-blur-sm bg-white/10 p-1 rounded-2xl">
          <Card className="bg-white/95 backdrop-blur-md shadow-2xl border-white/20 overflow-hidden">
            <CardHeader className="space-y-2 pb-2">
              <CardTitle className="text-3xl font-bold text-center text-gray-800">
                Bem-vindo
              </CardTitle>
              <CardDescription className="text-center text-base text-gray-600">
                Entre com suas credenciais para acessar o sistema
              </CardDescription>
            </CardHeader>

            <CardContent className="px-8 pb-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>

                  <div className="flex items-center gap-3 border-2 border-gray-300 rounded-lg px-4 h-11 bg-white transition-colors focus-within:border-blue-500">
                    <Mail className="w-5 h-5 text-gray-400 shrink-0" />
                    <div className="h-6 w-px bg-gray-300" />

                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="flex-1 border-0 shadow-none p-0 h-auto bg-transparent focus-visible:ring-0 focus-visible:border-0"
                    />
                  </div>
                </Field>

                <Field>
                  <FieldLabel htmlFor="password">Senha</FieldLabel>

                  <div className="flex items-center gap-3 border-2 border-gray-300 rounded-lg px-4 h-11 bg-white transition-colors focus-within:border-blue-500">
                    <Lock className="w-5 h-5 text-gray-400 shrink-0" />
                    <div className="h-6 w-px bg-gray-300" />

                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="flex-1 border-0 shadow-none p-0 h-auto bg-transparent focus-visible:ring-0 focus-visible:border-0"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="shrink-0 p-1 -mr-1 cursor-pointer text-gray-500 hover:text-gray-800 transition-colors focus:outline-none"
                      tabIndex={-1}
                      aria-label={
                        showPassword ? "Ocultar senha" : "Mostrar senha"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </Field>

                <div className="flex flex-col justify-center pt-1 gap-2">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 text-base font-semibold bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all"
                  >
                    {loading ? "Entrando..." : "Entrar"}
                  </Button>
                  <Button
                    type="button"
                    className="w-full h-11 text-base font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 rounded-lg transition-all"
                    onClick={setUserAdmin}
                  >Login Admin (Testes)</Button>
                </div>
              </form>
              <div className=" border-t border-gray-200 pt-4 text-center text-sm text-gray-400 space-y-2">
                <p>Gerenciador de Estoque &mdash; Diego Ramos dos Santos</p>
                <p>
                  <a
                    href="https://github.com/DiegoRamos1012"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:text-gray-600 transition-colors"
                  >
                    GitHub: DiegoRamos1012
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
