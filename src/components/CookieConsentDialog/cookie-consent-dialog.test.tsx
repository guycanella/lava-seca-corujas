import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { screen, waitFor, within } from "@testing-library/react";

import CookieConsentDialog from "@/components/CookieConsentDialog/CookieConsentDialog";
import { renderWithProviders } from "@/lib/render";
import * as cookieConsent from "@/lib/cookieConsent";

const announceMock = vi.fn();

vi.mock("@/contexts/GlobalLiveRegion", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/contexts/GlobalLiveRegion")>();
  return {
    ...actual,
    useGlobalLiveRegion: () => ({ announce: announceMock }),
  };
});

vi.mock("@/lib/cookieConsent", () => ({
  getCookieConsent: vi.fn(),
  setCookieConsent: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
  announceMock.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("CookieConsentDialog (integration)", () => {
  it("does not render the dialog when consent is already accepted", () => {
    vi.mocked(cookieConsent.getCookieConsent).mockReturnValue("accepted");

    renderWithProviders({
      ui: <CookieConsentDialog />,
      withTheme: false,
    });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders the dialog when consent is not accepted", () => {
    vi.mocked(cookieConsent.getCookieConsent).mockReturnValue(null);

    renderWithProviders({
      ui: <CookieConsentDialog />,
      withTheme: false,
    });

    const dialog = screen.getByRole("dialog");
    const withinDialog = within(dialog);

    expect(withinDialog.getByText(/Usamos cookies/i)).toBeInTheDocument();
    expect(
      withinDialog.getByText(/Utilizamos cookies para melhorar sua experiência/i)
    ).toBeInTheDocument();

    expect(withinDialog.getByRole("button", { name: /aceitar uso de cookies/i })).toBeInTheDocument();
    expect(withinDialog.getByRole("button", { name: /rejeitar uso de cookies/i })).toBeInTheDocument();
  });

  it("accepts cookies, closes the dialog and announces", async () => {
    const user = userEvent.setup();
    vi.mocked(cookieConsent.getCookieConsent).mockReturnValue(null);

    renderWithProviders({
      ui: <CookieConsentDialog />,
      withTheme: false,
    });

    const dialog = screen.getByRole("dialog");
    const withinDialog = within(dialog);

    const acceptButton = withinDialog.getByRole("button", { name: /aceitar uso de cookies/i });
    await user.click(acceptButton);

    await waitFor(() => {
      expect(cookieConsent.setCookieConsent).toHaveBeenCalledWith("accepted");
    });

    expect(announceMock).toHaveBeenCalledWith("Consentimento de cookies aceito.", "polite");

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("rejects cookies, closes the dialog and announces assertive", async () => {
    const user = userEvent.setup();
    vi.mocked(cookieConsent.getCookieConsent).mockReturnValue(null);

    renderWithProviders({
      ui: <CookieConsentDialog />,
      withTheme: false,
    });

    const dialog = screen.getByRole("dialog");
    const withinDialog = within(dialog);

    const declineButton = withinDialog.getByRole("button", { name: /rejeitar uso de cookies/i });
    await user.click(declineButton);

    await waitFor(() => {
      expect(cookieConsent.setCookieConsent).toHaveBeenCalledWith("declined");
    });

    expect(announceMock).toHaveBeenCalledWith("Consentimento de cookies rejeitado.", "assertive");

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("closes the dialog when onOpenChange is called with false", async () => {
    const user = userEvent.setup();
    vi.mocked(cookieConsent.getCookieConsent).mockReturnValue(null);

    renderWithProviders({
      ui: <CookieConsentDialog />,
      withTheme: false,
    });

    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.keyboard("{Escape}");

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });
});