// src/components/LoginForm/login-form.test.tsx
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { screen, waitFor } from "@testing-library/react";
import { QueryClient } from "@tanstack/react-query";
import { renderWithProviders } from "@/lib/render";

const hoisted = vi.hoisted(() => ({
  mockReplace: vi.fn(),
  mockUseSearchParams: {
    get: vi.fn(() => null as string | null),
    has: vi.fn(() => false),
    entries: vi.fn(() => [][Symbol.iterator]()),
    keys: vi.fn(() => [][Symbol.iterator]()),
    values: vi.fn(() => [][Symbol.iterator]()),
    toString: vi.fn(() => ""),
    forEach: vi.fn(),
    append: vi.fn(),
    delete: vi.fn(),
    set: vi.fn(),
    sort: vi.fn(),
  } as unknown as URLSearchParams,
  mockToast: {
    success: vi.fn(),
    error: vi.fn(),
  },
  announceMock: vi.fn<(msg: string, politeness?: "off" | "polite" | "assertive") => void>(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: hoisted.mockReplace,
    push: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => hoisted.mockUseSearchParams,
}));

vi.mock("sonner", () => ({
  toast: hoisted.mockToast,
}));

vi.mock("@/contexts/GlobalLiveRegion", async () => {
    const actual = await vi.importActual<typeof import("@/contexts/GlobalLiveRegion")>(
      "@/contexts/GlobalLiveRegion"
    );
    return {
      ...actual,
      useGlobalLiveRegion: () => ({
        announce: hoisted.announceMock,
      }),
    };
  });

vi.mock("lucide-react", () => ({
  LockIcon: (props: React.SVGProps<SVGSVGElement>) => (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" {...props} />
  ),
  Loader2Icon: (props: React.SVGProps<SVGSVGElement>) => (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" {...props} />
  ),
}));

import LoginForm from "@/components/LoginForm/LoginForm";

beforeEach(() => {
  vi.clearAllMocks();
  hoisted.mockUseSearchParams.get = vi.fn(() => null);
  global.fetch = undefined as unknown as typeof fetch;
});

describe("LoginForm (integration)", () => {
  it("renders fields and button with basic accessibility", () => {
    const qc = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });

    renderWithProviders({
      ui: <LoginForm />,
      withTheme: false,
      queryClient: qc,
    });

    const form = screen.getByRole("form", { name: /formulário de login/i });
    expect(form).toBeInTheDocument();

    const emailInput = screen.getByRole("textbox", { name: /e-mail/i });
    expect(emailInput).toBeInTheDocument();

    const passwordInput = screen.getByLabelText(/senha/i);
    expect(passwordInput).toHaveAttribute("type", "password");

    const submitBtn = screen.getByRole("button", { name: /entrar/i });
    expect(submitBtn).toBeEnabled();
  });

  it("displays validation messages when submitting with empty fields", async () => {
    const user = userEvent.setup();
    const qc = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });

    renderWithProviders({
      ui: <LoginForm />,
      withTheme: false,
      queryClient: qc,
    });

    const submitBtn = screen.getByRole("button", { name: /entrar/i });
    await user.click(submitBtn);

    const emailError = await screen.findByText((content, node) => {
        const el = node as HTMLElement | null;
        return el?.id === "email-error" && Boolean(content?.toString().trim());
    });

    const passwordError = await screen.findByText((content, node) => {
        const el = node as HTMLElement | null;
        return el?.id === "password-error" && Boolean(content?.toString().trim());
    });

    expect(emailError).toBeInTheDocument();
    expect(passwordError).toBeInTheDocument();
  });

  it("logs in successfully, invalidates user, announces, notifies and redirects to /reservar when there is no redirectTo", async () => {
    const user = userEvent.setup();
    const qc = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    const invalidateSpy = vi.spyOn(qc, "invalidateQueries");

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ success: true }),
    } as unknown as Response);
    global.fetch = fetchMock;

    hoisted.mockUseSearchParams.get = vi.fn(() => null);

    renderWithProviders({
      ui: <LoginForm />,
      withTheme: false,
      queryClient: qc,
    });

    const emailInput = screen.getByRole("textbox", { name: /e-mail/i });
    const passwordInput = screen.getByLabelText(/senha/i);
    const submitBtn = screen.getByRole("button", { name: /entrar/i });

    await user.type(emailInput, "user@example.com");
    await user.type(passwordInput, "senha123");
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByRole("form", { name: /formulário de login/i })).toHaveAttribute("aria-busy", "true");
      expect(screen.getByRole("button", { name: /entrando\.\.\./i })).toBeDisabled();
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/auth/login",
        expect.objectContaining({
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        })
      );
    });

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["user"] });
    });

    await waitFor(() => {
      expect(hoisted.mockToast.success).toHaveBeenCalledWith("Login realizado com sucesso");
      expect(hoisted.announceMock).toHaveBeenCalledWith("Login realizado com sucesso.", "polite");
      expect(hoisted.mockReplace).toHaveBeenCalledWith("/reservar");
    });
  });

  it("logs in successfully and redirects to redirectTo when present", async () => {
    const user = userEvent.setup();
    const qc = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ success: true }),
    } as unknown as Response);
    global.fetch = fetchMock;

    hoisted.mockUseSearchParams.get = vi.fn((key: string) => (key === "redirectTo" ? "/minha-pagina" : null));

    renderWithProviders({
      ui: <LoginForm />,
      withTheme: false,
      queryClient: qc,
    });

    await user.type(screen.getByRole("textbox", { name: /e-mail/i }), "user@example.com");
    await user.type(screen.getByLabelText(/senha/i), "senha123");
    await user.click(screen.getByRole("button", { name: /entrar/i }));

    await waitFor(() => {
      expect(hoisted.mockReplace).toHaveBeenCalledWith("/minha-pagina");
    });
  });

  it('displays error "E-mail ou senha inválidos." when API returns error with "invalid"', async () => {
    const user = userEvent.setup();
    const qc = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });

    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ error: "Invalid credentials" }),
    } as unknown as Response);
    global.fetch = fetchMock;

    renderWithProviders({
      ui: <LoginForm />,
      withTheme: false,
      queryClient: qc,
    });

    await user.type(screen.getByRole("textbox", { name: /e-mail/i }), "user@example.com");
    await user.type(screen.getByLabelText(/senha/i), "senhaerrada");
    await user.click(screen.getByRole("button", { name: /entrar/i }));

    await waitFor(() => {
      expect(hoisted.mockToast.error).toHaveBeenCalledWith(
        "Erro ao tentar fazer login",
        expect.objectContaining({
          description: "E-mail ou senha inválidos.",
        })
      );
      expect(hoisted.announceMock).toHaveBeenCalledWith("Erro ao tentar fazer login", "assertive");
      expect(hoisted.mockReplace).not.toHaveBeenCalled();
    });
  });

  it("displays generic error when API fails with another message", async () => {
    const user = userEvent.setup();
    const qc = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });

    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: "Erro no servidor" }),
    } as unknown as Response);
    global.fetch = fetchMock;

    renderWithProviders({
      ui: <LoginForm />,
      withTheme: false,
      queryClient: qc,
    });

    await user.type(screen.getByRole("textbox", { name: /e-mail/i }), "user@example.com");
    await user.type(screen.getByLabelText(/senha/i), "senhaerrada");
    await user.click(screen.getByRole("button", { name: /entrar/i }));

    await waitFor(() => {
      expect(hoisted.mockToast.error).toHaveBeenCalledWith(
        "Erro ao tentar fazer login",
        expect.objectContaining({
          description: "Erro no servidor",
        })
      );
      expect(hoisted.announceMock).toHaveBeenCalledWith("Erro ao tentar fazer login", "assertive");
      expect(hoisted.mockReplace).not.toHaveBeenCalled();
    });
  });

  it("normalizes email (trim + lowercase) before sending", async () => {
    const user = userEvent.setup();
    let capturedBody = "";
    const qc = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });

    const fetchMock = vi.fn().mockImplementation(async (_url: string, init?: RequestInit) => {
        capturedBody = typeof init?.body === "string" ? init.body : "";
        return {
          ok: true,
          status: 200,
          json: () => Promise.resolve({ success: true }),
        } as unknown as Response;
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    renderWithProviders({
      ui: <LoginForm />,
      withTheme: false,
      queryClient: qc,
    });

    await user.type(screen.getByRole("textbox", { name: /e-mail/i }), "  USER@Example.com  ");
    await user.type(screen.getByLabelText(/senha/i), "senha123");
    await user.click(screen.getByRole("button", { name: /entrar/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });

    const parsed = JSON.parse(capturedBody || "{}") as { email?: string; password?: string };
    expect(parsed.email).toBe("user@example.com");
    expect(parsed.password).toBe("senha123");
  });
});