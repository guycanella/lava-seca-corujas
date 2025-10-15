"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createContext, useContextSelector } from "use-context-selector";

type Theme = "light" | "dark" | "system";

type ThemeContextType = {
    theme: Theme;
    isDark: boolean;
    setTheme: (t: Theme) => void;
    toggleDark: (force?: boolean) => void;
    mounted: boolean;
}

type ThemeProviderProps = {
    children: React.ReactNode;
    defaultTheme: Theme;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider(
    { children, defaultTheme }: ThemeProviderProps
) {
    const [theme, setThemeState] = useState<Theme>(defaultTheme);
    const [mounted, setMounted] = useState(false);

    const applyTheme = useCallback((t: Theme) => {
        const root = document.documentElement;
        const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const effectiveDark = t === "dark" || (t === "system" && systemDark);
    
        root.classList.toggle("dark", effectiveDark);
    }, []);

    useEffect(() => {
        setMounted(true);
        const saved = (localStorage.getItem("theme") as Theme) || "system";
        setThemeState(saved);
        applyTheme(saved);
    
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        const handler = () => {
            const current = (localStorage.getItem("theme") as Theme) || "system";
            if (current === "system") applyTheme("system");
        };
        mq.addEventListener?.("change", handler);

        return () => mq.removeEventListener?.("change", handler);
    }, [applyTheme]);

    const setTheme = useCallback(
        (t: Theme) => {
            localStorage.setItem("theme", t);
            setThemeState(t);
            applyTheme(t);
        },
        [applyTheme]
    );

    const toggleDark = useCallback(
        (force?: boolean) => {
          const root = document.documentElement;
          const currentlyDark = root.classList.contains("dark");
          const nextDark = force ?? !currentlyDark;
          setTheme(nextDark ? "dark" : "light");
        },
        [setTheme]
    );
    
      const isDark = useMemo(() => {
        if (!mounted) return false;
        if (theme === "system") {
            if (typeof window === "undefined") return false;
            return window.matchMedia("(prefers-color-scheme: dark)").matches;
        }

        return theme === "dark";
    }, [theme, mounted]);

    const value = useMemo(() => (
        { theme, isDark, setTheme, toggleDark, mounted }), 
    [theme, isDark, setTheme, toggleDark, mounted]);

    return (
        <ThemeContext.Provider
            value={value}
        >
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const context = useContextSelector(ThemeContext, (context) => context);

    if (!context)
        throw new Error("useTheme must be used within a ThemeProvider");

    return context;
}