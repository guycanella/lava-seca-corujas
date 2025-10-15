"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/contexts/ThemeContext";
import { Switch } from "@/components/ui/switch";

export default function ThemeSwitch() {
    const { isDark, toggleDark, mounted } = useTheme();
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        if (mounted) setChecked(isDark);
    }, [mounted, isDark]);

    if (!mounted) {
        return <div className="h-6 w-10 rounded-full bg-muted/40" aria-hidden="true" />;
    }

    const labelId = "theme-switch-label";
    const stateId = "theme-switch-state";

    return (
        <div
            className="flex justify-end gap-2 p-4"
            role="group"
            aria-labelledby={labelId}
        >
            <span id={labelId} className="sr-only">
                Alternar tema claro/escuro
            </span>

            <Sun className="h-4 w-4 text-yellow-500" aria-hidden="true" />
            <Switch
                id="theme-switch"
                checked={checked}
                onCheckedChange={(c) => {
                    setChecked(c);
                    toggleDark(c)
                }}
                aria-label="Alternar tema claro/escuro"
                aria-describedby={stateId}
            />
            <Moon className="h-4 w-4 text-green-wings" aria-hidden="true" />

            <span id={stateId} className="sr-only">
                {checked ? "Modo escuro ativado" : "Modo claro ativado"}
            </span>
        </div>
    )
}