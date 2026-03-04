import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import { Field, FieldGroup, FieldLabel } from "./components/ui/field";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { Mail, Lock } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Preencha email e senha");
      return;
    }
    setError("");
    console.log("login:", { email, password });
  }

  return (
    <div
      className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/img/background-stock-employee.webp')" }}
    >
      <div className="w-full max-w-md">
        <div className="backdrop-blur-sm bg-white/10 p-1 rounded-2xl">
          <Card className="bg-white/95 backdrop-blur-md shadow-2xl border-white/20 overflow-hidden">
            <CardHeader className="space-y-3 pb-8">
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
                  <FieldLabel
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700"
                  >
                    Email
                  </FieldLabel>
                  <div className="flex items-center gap-3 border border-gray-300 rounded-lg px-4 py-2.5 h-11 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all duration-200">
                    <Mail className="w-5 h-5 text-gray-400 shrink-0" />
                    <div className="h-6 w-px bg-gray-300"></div>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="border-0 shadow-none p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                </Field>
                <Field>
                  <FieldLabel
                    htmlFor="password"
                    className="text-sm font-medium text-gray-700"
                  >
                    Senha
                  </FieldLabel>
                  <div className="flex items-center gap-3 border border-gray-300 rounded-lg px-4 py-2.5 h-11 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all duration-200">
                    <Lock className="w-5 h-5 text-gray-400 shrink-0" />
                    <div className="h-6 w-px bg-gray-300"></div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="border-0 shadow-none p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-gray-900"
                    />
                  </div>
                </Field>
                {error && (
                  <p className="text-sm text-red-600 text-center">{error}</p>
                )}
                <div className="flex justify-center pt-2">
                  <Button
                    type="submit"
                    className="px-12 h-11 text-base font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl border border-blue-800/20 transition-all duration-200"
                  >
                    Entrar
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
