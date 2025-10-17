import { supabaseServer } from "@/lib/supabaseServer";
import { getUserInformation } from "@/lib/user/getUserInformation";
import { NextResponse } from "next/server";

export async function GET() {
    const supabase = await supabaseServer();
    const {
        data: { user },
        error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
        return NextResponse.json({
            error: "Não autenticado"
        }, { status: 401 });
    }

    const userData = await getUserInformation(user.id);

    if (!userData.ok) {
        return NextResponse.json(userData, { status: 400 });
    }
    
    return NextResponse.json(userData, { status: 200 });
}