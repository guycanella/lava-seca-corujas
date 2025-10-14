import { redirect } from "next/navigation";
import LoginForm from "@/components/LoginForm/LoginForm";
import { supabaseServer } from "@/lib/supabaseServer";

export default async function LoginPage() {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect("/reservar");
  }

  return (
    <div className="flex flex-col items-center h-screen p-4 gap-4">
      <h1 className="text-2xl font-bold">Lavanderia Corujas</h1>
      <LoginForm />
    </div>
  );
}
