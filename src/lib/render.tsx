import CookieConsentDialog from "@/components/CookieConsentDialog/CookieConsentDialog";
import { GlobalLiveRegionProvider } from "@/contexts/GlobalLiveRegion";
import { UserProvider } from "@/contexts/UserContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

type RenderWithProvidersProps = {
    ui: React.ReactNode
    route?: string
    withToaster?: boolean;
    withCookieConsent?: boolean;
    withTheme?: boolean;
    withAppProviders?: boolean;
    queryClient?: QueryClient;
}

export function renderWithProviders({
    ui, 
    route,
    withToaster = false, 
    withCookieConsent = false, 
    withTheme = true, 
    withAppProviders = false,
    queryClient
}: RenderWithProvidersProps) {
    const qc = queryClient ?? new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    
    if (route) {
        window.history.pushState({}, "Test page", route);
    }

    if (withAppProviders) {
        return render(
          <QueryClientProvider client={qc}>
            <UserProvider>
                <GlobalLiveRegionProvider>
                    <main id="main-content" role="main">
                        {ui}
                        {withToaster && <Toaster richColors closeButton position="bottom-right" />}
                        {withCookieConsent && <CookieConsentDialog />}
                    </main>
                </GlobalLiveRegionProvider>
            </UserProvider>
          </QueryClientProvider>
        );
    }

    return render(
        <QueryClientProvider client={qc}>
          {withTheme ? (
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <UserProvider>
                <GlobalLiveRegionProvider>
                  <main id="main-content" role="main">{ui}</main>
                  {withToaster && <Toaster richColors closeButton position="bottom-right" />}
                  {withCookieConsent && <CookieConsentDialog />}
                </GlobalLiveRegionProvider>
              </UserProvider>
            </ThemeProvider>
          ) : (
            <UserProvider>
              <GlobalLiveRegionProvider>
                <main id="main-content" role="main">{ui}</main>
                {withToaster && <Toaster richColors closeButton position="bottom-right" />}
                {withCookieConsent && <CookieConsentDialog />}
              </GlobalLiveRegionProvider>
            </UserProvider>
          )}
        </QueryClientProvider>
    );
}