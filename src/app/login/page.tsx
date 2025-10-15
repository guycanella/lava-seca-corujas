import { redirect } from "next/navigation";
import Image from "next/image";

import LoginForm from "@/components/LoginForm/LoginForm";
import { supabaseServer } from "@/lib/supabaseServer";

import corujaLogo from "../../../public/coruja-logo.png";

export default async function LoginPage() {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect("/reservar");
  }

  return (
    <div className="flex flex-col items-center h-screen p-4 gap-4">
      <h1 className="text-2xl font-bold text-green-wings">
        Lavanderia das Corujas
      </h1>

      <Image
        src={corujaLogo}
        alt="Mascote Coruja da Lavanderia das Corujas"
        width={200}
        height={200}
        placeholder="blur"
        blurDataURL={corujaLogo.blurDataURL}
        priority
      />
      
      <LoginForm />
    </div>
  );
}
