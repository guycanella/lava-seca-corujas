"use client"

import { useEffect, useState } from "react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";

import { Button } from "../ui/button";
import { getCookieConsent, setCookieConsent } from "@/lib/cookieConsent";
import { useGlobalLiveRegion } from "@/contexts/GlobalLiveRegion";

export default function CookieConsentDialog() {
    const [open, setOpen] = useState(false);
    const { announce } = useGlobalLiveRegion();

    useEffect(() => {
        const consent = getCookieConsent();
        if (!consent) setOpen(true);
    }, []);

    const handleAccept = () => {
        setCookieConsent("accepted");
        setOpen(false);
        announce("Consentimento de cookies aceito.", "polite");
    };
    
      const handleDecline = () => {
        setCookieConsent("declined");
        setOpen(false);
        announce("Consentimento de cookies rejeitado.", "assertive");
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Usamos cookies</DialogTitle>

                    <DialogDescription>
                        Utilizamos cookies para melhorar sua experiência, 
                        lembrar preferências e, com seu consentimento,
                        coletar métricas de uso. Você pode alterar essa 
                        escolha depois nas configurações.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter>
                    <Button
                        type="button"
                        onClick={handleAccept}
                        aria-label="Aceitar uso de cookies"
                    >
                            Aceitar
                    </Button>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={handleDecline}
                        aria-label="Rejeitar uso de cookies"
                    >
                        Rejeitar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}