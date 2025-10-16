// src/components/ThemeSwitch/theme-switch.test.tsx
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { screen, within } from "@testing-library/react";
import { renderWithProviders } from "@/lib/render";

const hoisted = vi.hoisted(() => ({
  useThemeMock: vi.fn<() => {
    isDark: boolean;
    toggleDark: (c: boolean) => void;
    mounted: boolean;
  }>(),
}));

vi.mock("@/contexts/ThemeContext", () => {
  return {
    useTheme: hoisted.useThemeMock,
  };
});

vi.mock("@/components/ui/switch", () => {
  return {
    Switch: (props: React.ComponentProps<"input"> & { onCheckedChange?: (checked: boolean) => void }) => {
      const { onCheckedChange, checked, id, ...rest } = props;
      
      return (
        <input
          type="checkbox"
          role="switch"
          aria-label={props["aria-label"]}
          aria-describedby={props["aria-describedby"]}
          id={id}
          checked={!!checked}
          onChange={(e) => onCheckedChange?.(e.currentTarget.checked)}
          {...rest}
        />
      );
    },
  };
});

vi.mock("lucide-react", () => ({
  Sun: (
    props: React.HTMLAttributes<HTMLSpanElement>
) => <span data-icon="sun" {...props} />,
  Moon: (
    props: React.HTMLAttributes<HTMLSpanElement>
) => <span data-icon="moon" {...props} />,
}));

import ThemeSwitch from "@/components/ThemeSwitch/ThemeSwitch";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ThemeSwitch", () => {
  it("renders skeleton when not mounted", () => {
    hoisted.useThemeMock.mockReturnValue({
      isDark: false,
      mounted: false,
      toggleDark: vi.fn(),
    });

    renderWithProviders({
      ui: <ThemeSwitch />,
      withTheme: false,
    });

    const skeletonDiv = 
        document.querySelector('div[aria-hidden="true"].h-6.w-10.rounded-full.bg-muted\\/40');
    expect(skeletonDiv).toBeTruthy();
  });

  it("synchronizes initial state with isDark when mounted=true", () => {
    hoisted.useThemeMock.mockReturnValue({
      isDark: true,
      mounted: true,
      toggleDark: vi.fn(),
    });

    renderWithProviders({
      ui: <ThemeSwitch />,
      withTheme: false,
    });

    const group = screen.getByRole("group", {
        name: /alternar tema claro\/escuro/i,
    });
    const withinGroup = within(group);

    const switchEl = withinGroup.getByRole("switch", {
        name: /alternar tema claro\/escuro/i,
    }) as HTMLInputElement;
    expect(switchEl.checked).toBe(true);

    withinGroup.getByText(/modo escuro ativado/i);
  });

  it("switches from light to dark by calling toggleDark(true)", async () => {
    const user = userEvent.setup();
    const toggleDark = vi.fn();

    hoisted.useThemeMock.mockReturnValue({
      isDark: false,
      mounted: true,
      toggleDark,
    });

    renderWithProviders({
      ui: <ThemeSwitch />,
      withTheme: false,
    });

    const group = screen.getByRole("group", {
        name: /alternar tema claro\/escuro/i,
    });
    const withinGroup = within(group);

    const switchEl = withinGroup.getByRole("switch", {
        name: /alternar tema claro\/escuro/i,
    }) as HTMLInputElement;

    expect(switchEl.checked).toBe(false);
    withinGroup.getByText(/modo claro ativado/i);

    await user.click(switchEl);

    expect(toggleDark).toHaveBeenCalledWith(true);
    expect(switchEl.checked).toBe(true);
    withinGroup.getByText(/modo escuro ativado/i);
  });

  it("switches from dark to light by calling toggleDark(false)", async () => {
    const user = userEvent.setup();
    const toggleDark = vi.fn();

    hoisted.useThemeMock.mockReturnValue({
      isDark: true,
      mounted: true,
      toggleDark,
    });

    renderWithProviders({
      ui: <ThemeSwitch />,
      withTheme: false,
    });

    const group = screen.getByRole("group", {
        name: /alternar tema claro\/escuro/i,
    });
    const withinGroup = within(group);

    const switchEl = withinGroup.getByRole("switch", {
        name: /alternar tema claro\/escuro/i,
    }) as HTMLInputElement;

    expect(switchEl.checked).toBe(true);
    withinGroup.getByText(/modo escuro ativado/i);

    await user.click(switchEl);

    expect(toggleDark).toHaveBeenCalledWith(false);
    expect(switchEl.checked).toBe(false);
    withinGroup.getByText(/modo claro ativado/i);
  });

  it("maintains accessibility: group with label sr-only and dynamic description", () => {
    hoisted.useThemeMock.mockReturnValue({
      isDark: false,
      mounted: true,
      toggleDark: vi.fn(),
    });

    renderWithProviders({
      ui: <ThemeSwitch />,
      withTheme: false,
    });

    const group = screen.getByRole("group", {
        name: /alternar tema claro\/escuro/i,
    });
    expect(group).toBeInTheDocument();

    const switchEl = screen.getByRole("switch", {
        name: /alternar tema claro\/escuro/i,
    });
    expect(switchEl).toHaveAttribute("aria-describedby");

    const descId = switchEl.getAttribute("aria-describedby")!;
    const desc = document.getElementById(descId);

    expect(desc).toBeTruthy();
    expect(desc?.textContent?.toLowerCase()).toMatch(/modo claro ativado|modo escuro ativado/);
  });
});