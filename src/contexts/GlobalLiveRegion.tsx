"use client"

import { useCallback, useRef, useState } from "react";
import { createContext, useContextSelector } from "use-context-selector";

type Politeness = "polite" | "assertive"

type GlobalLiveRegionContextType = {
    announce: (message: string, politeness?: Politeness) => void;
}

type GlobalLiveRegionProviderProps = {
    children: React.ReactNode;
}

const GlobalLiveRegionContext = createContext<GlobalLiveRegionContextType | null>(null);

export function GlobalLiveRegionProvider(
    { children }: GlobalLiveRegionProviderProps
) {
    const [politeMessage, setPoliteMessage] = useState("");    
    const [assertiveMessage, setAssertiveMessage] = useState("");
    const politeKeyRef = useRef(0);
    const assertiveKeyRef = useRef(0);

    const announce = useCallback((
        message: string,
        politeness: Politeness = "polite"
    ) => {
        if (politeness === "assertive") {
            assertiveKeyRef.current += 1;
            setAssertiveMessage(message);
            setPoliteMessage("");
        } else {
            politeKeyRef.current += 1;
            setPoliteMessage(message);
            setAssertiveMessage("");
        }

        window.setTimeout(() => {
            if (politeness === "assertive") {
                setAssertiveMessage("");
            } else {
                setPoliteMessage("");
            }
        }, 3000);
    }, []);

    return (
        <GlobalLiveRegionContext.Provider value={{ announce }}>
            {children}
            <div className="sr-only" aria-live="polite" aria-atomic="true">
                <span key={politeKeyRef.current}>
                    {politeMessage}
                </span>
            </div>
            <div className="sr-only" aria-live="assertive" aria-atomic="true">
                <span key={assertiveKeyRef.current}>
                    {assertiveMessage}
                </span>
            </div>
        </GlobalLiveRegionContext.Provider>
    );
}

export function useGlobalLiveRegion() {
    const context = useContextSelector(
        GlobalLiveRegionContext, (context) => context
    );
    
    if (!context) {
        throw new Error("useGlobalLiveRegion must be used within a GlobalLiveRegionProvider");
    }

    return context;
}