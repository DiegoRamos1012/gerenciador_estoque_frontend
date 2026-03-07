import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Button } from "./components/ui/button";

export default function Home({ onLogout }: { onLogout?: () => void }) {
  return (
    <div
      className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/img/background-stock-employee.webp')" }}
    >
      <div className="w-full max-w-md">
        <Card className="bg-white/95 backdrop-blur-md shadow-2xl border-white/20 overflow-hidden">
          <CardHeader className="space-y-3 pb-4">
            <CardTitle className="text-2xl font-bold text-center text-gray-800">
              Home
            </CardTitle>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <p className="text-center text-gray-700 mb-4">
              Usuário autenticado — esta é a tela de teste.
              
            </p>
            <div className="flex justify-center">
              <Button onClick={() => onLogout?.()} className="px-6">
                Sair
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
