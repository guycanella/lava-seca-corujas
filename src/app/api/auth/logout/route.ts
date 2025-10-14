import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST() {
    const supabase = await supabaseServer();
    const { error } = await supabase.auth.signOut();

    if (error) {
        return NextResponse.json({
            error: error.message || "Erro ao fazer."
        }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
}