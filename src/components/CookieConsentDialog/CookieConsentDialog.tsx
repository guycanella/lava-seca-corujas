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

import { getCookieConsent, setCookieConsent } from "@/lib/cookieConsent";
import { Button } from "../ui/button";

export default function CookieConsentDialog() {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const consent = getCookieConsent();
        if (!consent) setOpen(true);
    }, []);

    const handleAccept = () => {
        setCookieConsent("accepted");
        setOpen(false);
    };
    
      const handleDecline = () => {
        setCookieConsent("declined");
        setOpen(false);
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
                        onClick={handleAccept}
                        variant="secondary"
                    >
                            Aceitar
                    </Button>
                    <Button
                        onClick={handleDecline}
                    >
                        Rejeitar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}