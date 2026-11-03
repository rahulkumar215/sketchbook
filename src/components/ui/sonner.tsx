"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
} from "lucide-react";

/*
 * Toasts wear the popover surface (same as menus and dialogs), square like
 * the rest of the Lyra preset. Only the icon carries the status colour.
 *
 * Sonner injects its CSS outside Tailwind's layers, so it wins over any
 * utility that targets a property it sets itself (padding, gap, description
 * colour): those utilities need `!`. Properties it doesn't set (icon colour,
 * font family, title/description size) work as plain utilities.
 */
const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "0px",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast gap-2.5! p-3! font-sans",
          title: "text-xs font-medium",
          description: "text-xs text-muted-foreground!",
          success: "[&_[data-icon]]:text-primary",
          error: "[&_[data-icon]]:text-destructive",
          warning: "[&_[data-icon]]:text-muted-foreground",
          info: "[&_[data-icon]]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
