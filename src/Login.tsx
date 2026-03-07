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

            <CardContent className="px-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>

                  <div className="relative flex items-center gap-3 border-2 border-gray-300 rounded-lg px-4 py-2.5 h-11 bg-white">
                    <Mail className="w-5 h-5 text-gray-400 shrink-0" />
                    <div className="h-6 w-px bg-gray-300"></div>

                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="border-0 shadow-none p-0 h-auto bg-transparent focus-visible:ring-0 focus-visible:border-0"
                    />
                  </div>
                </Field>

                <Field>
                  <FieldLabel htmlFor="password">Senha</FieldLabel>

                  <div className="relative flex items-center gap-3 border-2 border-gray-300 rounded-lg px-4 py-2.5 h-11 bg-white">
                    <Lock className="w-5 h-5 text-gray-400 shrink-0" />
                    <div className="h-6 w-px bg-gray-300"></div>

                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="flex-1 border-0 shadow-none p-0 h-auto bg-transparent focus-visible:ring-0 focus-visible:border-0"
                    />

                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-0 top-1/2 -translate-y-1/2"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-900" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-900" />
                      )}
                    </Button>
                  </div>
                </Field>

                <div className="flex justify-center pt-2">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="px-12 h-11 text-base font-semibold bg-linear-to-r from-blue-600 to-blue-700 text-white"
                  >
                    {loading ? "Entrando..." : "Entrar"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
