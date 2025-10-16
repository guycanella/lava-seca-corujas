import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { screen, waitFor, within } from "@testing-library/react";

import { Header } from "@/components/Header/Header";
import { renderWithProviders } from "@/lib/render";
import { QueryClient } from "@tanstack/react-query";

const hoisted = vi.hoisted(() => ({
    mockReplace: vi.fn(),
    useUserMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
    useRouter: () => ({
        replace: hoisted.mockReplace,
        push: vi.fn(),
        back: vi.fn(),
        forward: vi.fn(),
        prefetch: vi.fn(),
        refresh: vi.fn(),
    }),
    usePathname: () => "/",
    useSearchParams: () => new URLSearchParams(),
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
  },
}));

vi.mock("@/contexts/UserContext", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/contexts/UserContext")>();
  return {
    ...actual,
    useUser: hoisted.useUserMock,
  };
});

vi.mock("@/lib/utils", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/utils")>();
  return {
    ...actual,
    formatName: (name: string) => name,
  };
});

beforeEach(() => {
  vi.clearAllMocks();
  hoisted.mockReplace.mockReset();
  hoisted.useUserMock.mockReset();
  global.fetch = undefined as unknown as typeof fetch;
});

describe("Header (integration)", () => {
  it("renders skeleton when loading user data", () => {
    hoisted.useUserMock.mockReturnValue({
      data: null,
      isLoading: true,
    });

    renderWithProviders({
      ui: <Header />,
      withTheme: false,
    });

    const header = screen.getByRole("banner", { name: /cabecalho da página/i });
    const withinHeader = within(header);

    expect(withinHeader.getByText(/Nome:/i)).toBeInTheDocument();
    expect(withinHeader.getByText(/Apto:/i)).toBeInTheDocument();

    expect(withinHeader.getByText(/Carregando nome do usuário/i)).toBeInTheDocument();
    expect(withinHeader.getByText(/Carregando número do apartamento/i)).toBeInTheDocument();

    expect(withinHeader.getByRole("button", { name: /sair da conta/i })).toBeEnabled();
  });

  it("renders user data when loading finishes", () => {
    hoisted.useUserMock.mockReturnValue({
      data: { name: "João Silva", apartment_number: "101" },
      isLoading: false,
    });

    renderWithProviders({
      ui: <Header />,
      withTheme: false,
    });

    const header = screen.getByRole("banner", { name: /cabecalho da página/i });
    const withinHeader = within(header);

    expect(withinHeader.getByText(/Nome:/i)).toBeInTheDocument();
    expect(withinHeader.getByText(/João Silva/i)).toBeInTheDocument();

    expect(withinHeader.getByText(/Apto:/i)).toBeInTheDocument();
    expect(withinHeader.getByText(/101/i)).toBeInTheDocument();

    expect(withinHeader.getByRole("button", { name: /sair da conta/i })).toBeEnabled();
  });

  it("makes logout successful, invalidates queries, clears cache and redirects", async () => {
    const user = userEvent.setup();
    hoisted.useUserMock.mockReturnValue({
      data: { name: "João Silva", apartment_number: "101" },
      isLoading: false,
    });

    const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true }),
        text: () => Promise.resolve(""),
      } as unknown as Response);
    global.fetch = fetchMock;

    const qc = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    const invalidateSpy = vi.spyOn(qc, "invalidateQueries");

    renderWithProviders({
      ui: <Header />,
      withTheme: false,
      queryClient: qc,
    });

    const { useRouter } = await import("next/navigation");
    expect(useRouter().replace).toBe(hoisted.mockReplace);

    const header = screen.getByRole("banner", { name: /cabecalho da página/i });
    const withinHeader = within(header);

    const logoutButton = withinHeader.getByRole("button", { name: /sair da conta/i });
    await user.click(logoutButton);

    await waitFor(() => {
      const saindo = withinHeader.getByRole("button", { name: /saindo, aguarde/i });
      expect(saindo).toHaveAttribute("aria-disabled", "true");
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });

    const logoutCalls = fetchMock.mock.calls.filter(([url, init]) => {
      const u = String(url);
      const method = (init as RequestInit | undefined)?.method ?? "GET";
      return u === "/api/auth/logout" && method.toUpperCase() === "POST";
    });

    expect(logoutCalls.length).toBeGreaterThanOrEqual(1);

    const [, reqInit] = logoutCalls[0] as [string, RequestInit];
    expect(reqInit).toEqual(
      expect.objectContaining({
        method: "POST",
        credentials: "include",
      })
    );

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["user"] });
    });

    await waitFor(() => {
      expect(hoisted.mockReplace).toHaveBeenCalledWith("/");
    });
  });

  it("shows error toast when logout fails", async () => {
    const user = userEvent.setup();
    hoisted.useUserMock.mockReturnValue({
      data: { name: "João Silva", apartment_number: "101" },
      isLoading: false,
    });

    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: "Erro no servidor" }),
    } as Response);
    global.fetch = fetchMock;

    renderWithProviders({
      ui: <Header />,
      withTheme: false,
    });

    const header = screen.getByRole("banner", { name: /cabecalho da página/i });
    const withinHeader = within(header);

    const logoutButton = withinHeader.getByRole("button", { name: /sair da conta/i });
    await user.click(logoutButton);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });

    const { toast } = await import("sonner");

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Erro ao fazer logout",
        expect.objectContaining({
          description: expect.stringContaining("Erro no servidor"),
        })
      );
    });

    expect(hoisted.mockReplace).not.toHaveBeenCalled();
  });

  it("button is disabled during pending", async () => {
    const user = userEvent.setup();
    hoisted.useUserMock.mockReturnValue({
      data: { name: "João Silva", apartment_number: "101" },
      isLoading: false,
    });

    const fetchMock = vi.fn().mockImplementation(
      () =>
        new Promise<Response>((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                status: 200,
                json: () => Promise.resolve({ success: true }),
              } as Response),
            100
          )
        )
    );
    global.fetch = fetchMock;

    renderWithProviders({
      ui: <Header />,
      withTheme: false,
    });

    const header = screen.getByRole("banner", { name: /cabecalho da página/i });
    const withinHeader = within(header);

    const logoutButton = withinHeader.getByRole("button", { name: /sair da conta/i });
    expect(logoutButton).toBeEnabled();

    await user.click(logoutButton);

    await waitFor(() => {
      const saindo = withinHeader.getByRole("button", { name: /saindo, aguarde/i });
      expect(saindo).toBeDisabled();
    });

    await waitFor(() => {
      expect(header).toHaveAttribute("aria-busy", "true");
    });
  });
});