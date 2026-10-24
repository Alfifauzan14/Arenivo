import * as React from "react";
import { cn } from "@/lib/utils";

export interface BrandLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "full" | "icon" | "stacked" | "mitra" | "admin";
  theme?: "light" | "dark";
  className?: string;
  showSubtitle?: boolean;
  subtitle?: string;
}

export function BrandLogoIcon({
  size = "md",
  theme = "light",
  className,
}: {
  size?: "sm" | "md" | "lg" | "xl";
  theme?: "light" | "dark";
  className?: string;
}) {
  const pixelSizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const logoSrc = theme === "dark" ? "/arenivo-logo-white.webp" : "/arenivo-logo.webp";

  return (
    <div
      className={cn(
        "relative shrink-0 flex items-center justify-center transition-transform hover:scale-105 select-none",
        pixelSizes[size],
        className
      )}
    >
      <img
        src={logoSrc}
        alt="Arenivo Logo"
        width={64}
        height={64}
        loading="eager"
        decoding="async"
        className="w-full h-full object-contain drop-shadow-xs"
      />
    </div>
  );
}

export function BrandLogo({
  size = "md",
  variant = "full",
  theme = "light",
  className,
  showSubtitle = true,
  subtitle,
}: BrandLogoProps) {
  const isDark = theme === "dark";

  if (variant === "icon") {
    return <BrandLogoIcon size={size} theme={theme} className={className} />;
  }

  const titleSizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-xl",
    xl: "text-2xl",
  };

  const subtitleSizes = {
    sm: "text-[9px] tracking-wider",
    md: "text-[10px] tracking-wider",
    lg: "text-[11px] tracking-widest",
    xl: "text-xs tracking-widest",
  };

  const defaultSubtitle = "Satu Aplikasi, Banyak Arena";

  return (
    <div className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      <BrandLogoIcon size={size} theme={theme} />

      <div className="flex flex-col justify-center leading-none">
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "font-black tracking-tight",
              titleSizes[size],
              isDark ? "text-white" : "text-slate-900"
            )}
          >
            Aren<span className="text-red-600">ivo</span>
          </span>

          {variant === "mitra" && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-700 border border-red-200">
              Mitra
            </span>
          )}

          {variant === "admin" && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-200">
              Admin
            </span>
          )}

          {variant === "full" && (
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 ml-0.5 inline-block shrink-0 animate-pulse" />
          )}
        </div>

        {showSubtitle && (
          <span
            className={cn(
              "font-medium mt-1 block truncate max-w-[200px] sm:max-w-none",
              subtitleSizes[size],
              isDark ? "text-slate-300" : "text-slate-500"
            )}
          >
            {subtitle || defaultSubtitle}
          </span>
        )}
      </div>
    </div>
  );
}

export default BrandLogo;
