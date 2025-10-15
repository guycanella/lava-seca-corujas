export const COOKIE_NAME = "cookie-consent"
export type CookieConsentType = "accepted" | "declined"

export function setCookieConsent(value: CookieConsentType, days = 180) {
    try {
        const expires = new Date(Date.now() + days * 864e5).toUTCString()
        document.cookie = `${COOKIE_NAME}=${value}; expires=${expires}; path=/; SameSite=Lax`;
    }catch {
        console.error("Erro ao salvar cookie de consentimento")
    }
}

export function getCookieConsent(): CookieConsentType | null {
    try {
        const match = document.cookie.match(new RegExp("(^| )" + COOKIE_NAME + "=([^;]+)"));

        if (match) return match[2] as CookieConsentType;

        const ls = localStorage.getItem(COOKIE_NAME) as CookieConsentType | null
        return ls || null;
    }catch {
        console.error("Erro ao carregar cookie de consentimento")
        return null;
    }
}