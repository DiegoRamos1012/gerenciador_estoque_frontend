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
    <div className="flex min-h-svh w-full items-center justify-center p-6 bg-gray-300 md:p-10">
      <div className="w-full bg-gray-200 max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex justify-center">Login</CardTitle>
            <CardDescription className="flex justify-center">Entre com o seu email e senha</CardDescription>
          </CardHeader>
          <CardContent>
            <form>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="exemplo@.com"
                    required
                  ></Input>
                </Field>
                <Field>
                  <FieldLabel htmlFor="password">Senha</FieldLabel>
                  <Input
                    id="password"
                    type="password"
                    placeholder="•••••••••"
                    required
                  ></Input>
                </Field>
              </FieldGroup>
              <div className="flex justify-center">
                <Button className="px-6">Login</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
