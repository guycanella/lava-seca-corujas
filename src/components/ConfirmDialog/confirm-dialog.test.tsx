import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { screen, waitFor, within } from "@testing-library/react";

import { ConfirmDialog } from "@/components/ConfirmDialog/ConfirmDialog";
import { renderWithProviders } from "@/lib/render";
import { QueryClient } from "@tanstack/react-query";
import { AlertDialog } from "../ui/alert-dialog";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/app/reservar/[machine]/useReservations", () => ({
  useReservations: () => ({ machineEnum: "washer" }),
}));

vi.mock("@/contexts/UserContext", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@/contexts/UserContext")>();
    return {
      ...actual,
      useUser: () => ({ data: { apartment_number: "101" } }),
    };
  });

const announceMock = vi.fn();
vi.mock("@/contexts/GlobalLiveRegion", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@/contexts/GlobalLiveRegion")>();
    return {
      ...actual,
      useGlobalLiveRegion: () => ({ announce: announceMock }),
    };
  });

beforeEach(() => {
  vi.restoreAllMocks();
  vi.resetAllMocks();
  announceMock.mockReset();
  global.fetch = undefined as unknown as typeof fetch;
});

// Helpers
function setupDialog(overrides?: Partial<React.ComponentProps<typeof ConfirmDialog>>) {
  const props: React.ComponentProps<typeof ConfirmDialog> = {
    type: "lavadora",
    time: "10:00",
    dayISO: "2025-10-16",
    date: new Date("2025-10-16T00:00:00"),
    onClose: vi.fn(),
    ...overrides,
  };

  renderWithProviders({
    ui: (
        <AlertDialog open>
            <ConfirmDialog {...props} />
        </AlertDialog>
    ),
    withTheme: false,
  });

  const dlg = screen.getByRole("alertdialog");
  const withinDlg = within(dlg);

  return { props, withinDlg };
}

describe("ConfirmDialog (integration)", () => {
  it("renders title and description with user data and time", () => {
    const { withinDlg } = setupDialog();

    expect(withinDlg.getByText(/Confirmar reserva/i)).toBeInTheDocument();

    expect(
        withinDlg.getByText(/Reservar a lavadora para o apartamento 101 às 10:00\?/i)
    ).toBeInTheDocument();

    expect(withinDlg.getByRole("button", { name: /Cancelar/i })).toBeEnabled();
    expect(withinDlg.getByRole("button", { name: /reservar|confirmar reserva/i })).toBeEnabled();
  });

  it("fires success mutation and closes with toast + announce + invalidateQueries", async () => {
    const user = userEvent.setup();

    const fetchMock = vi.fn().mockImplementation(
        () =>
          new Promise<Response>((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  status: 200,
                  json: () => Promise.resolve({ id: "ok" }),
                } as Response),
              100
            )
          )
      );
    global.fetch = fetchMock;

    const { withinDlg, props } = setupDialog();

    await user.click(withinDlg.getByRole("button", { name: /reservar|confirmar reserva/i }));

    await waitFor(() => {
        const reservando = withinDlg.getByRole("button", { name: /reservando/i });
        expect(reservando).toHaveAttribute("aria-disabled", "true");
      });

    await waitFor(() => {
      expect(props.onClose).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
        expect(fetchMock).toHaveBeenCalled();
    });

    const postCalls = fetchMock.mock.calls.filter(([url, init]) => {
        const u = String(url);
        const method = (init as RequestInit | undefined)?.method ?? "GET";
        return u === "/api/reservations" && method.toUpperCase() === "POST";
    });

    expect(postCalls.length).toBeGreaterThanOrEqual(1);

    const [, reqInit] = postCalls[0] as [string, RequestInit];
      
    expect(reqInit.body).toBeDefined();
      
    const body = JSON.parse(reqInit.body as string);

    expect(body).toMatchObject({
      start_time: "2025-10-16T13:00:00.000Z",
      equipment: "washer",
    });

    const { toast } = await import("sonner");

    expect(toast.success).toHaveBeenCalledWith("Reserva criada com sucesso");
    expect(announceMock).toHaveBeenCalledWith("Reserva criada com sucesso.", "polite");
  });

  it("fires error mutation and closes with toast + announce assertive", async () => {
    const user = userEvent.setup();

    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: "Falha no servidor" }),
    } as Response);
    global.fetch = fetchMock;

    const { withinDlg, props } = setupDialog();

    await user.click(withinDlg.getByRole("button", { name: /reservar|confirmar reserva/i }));

    await waitFor(() => {
      expect(props.onClose).toHaveBeenCalledTimes(1);
    });

    const { toast } = await import("sonner");

    expect(toast.error).toHaveBeenCalledWith(
      "Erro ao tentar reservar",
      expect.objectContaining({
        description: expect.stringContaining("Falha no servidor"),
      })
    );

    expect(announceMock).toHaveBeenCalledWith("Erro ao tentar reservar", "assertive");
  });

  it("conflict (status 409): closes and shows specific message in toast", async () => {
    const user = userEvent.setup();

    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 409,
      json: () => Promise.resolve({ error: "já existe" }),
    } as Response);
    global.fetch = fetchMock;

    const { withinDlg, props } = setupDialog();

    await user.click(withinDlg.getByRole("button", { name: /reservar|confirmar reserva/i }));

    await waitFor(() => {
      expect(props.onClose).toHaveBeenCalledTimes(1);
    });

    const { toast } = await import("sonner");
    expect(toast.error).toHaveBeenCalledWith(
        "Erro ao tentar reservar",
        expect.objectContaining({
            description: expect.stringContaining(
                "Esse horário acabou de ser reservado por outra pessoa."
            ),
        })
    );
  });

  it("botões ficam desabilitados durante pending", async () => {
    const user = userEvent.setup();

    const fetchMock = vi.fn().mockImplementation(
      () =>
        new Promise<Response>((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                status: 200,
                json: () => Promise.resolve({ ok: true }),
              } as Response),
            50
          )
        )
    );
    global.fetch = fetchMock;

    const { withinDlg } = setupDialog();

    const cancelar = withinDlg.getByRole("button", { name: /Cancelar/i });
    const reservar = withinDlg.getByRole("button", { name: /reservar|confirmar reserva/i });

    expect(cancelar).toBeEnabled();
    expect(reservar).toBeEnabled();

    await user.click(reservar);

    await waitFor(() => {
      expect(withinDlg.getByRole("button", { name: /Reservando/i })).toBeDisabled();
      expect(cancelar).toBeDisabled();
    });
  });

  it("invalida a query correta no sucesso", async () => {
    const user = userEvent.setup();

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ id: "ok" }),
    } as Response);
    global.fetch = fetchMock;

    const qc = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    const invalidateSpy = vi.spyOn(qc, "invalidateQueries");

    renderWithProviders({
      ui: (
        <AlertDialog open>
            <ConfirmDialog
              type="lavadora"
              time="10:00"
              dayISO="2025-10-16"
              date={new Date("2025-10-16T00:00:00")}
              onClose={vi.fn()}
            />
        </AlertDialog>
      ),
      withTheme: false,
      queryClient: qc,
    });

    await user.click(screen.getByRole("button", { name: /reservar|confirmar reserva/i }));

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["reservations", "2025-10-16", "washer"],
      });
    });
  });
});