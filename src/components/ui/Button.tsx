import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Tone = "terra" | "ink" | "linen" | "outline" | "outline-linen";

const tones: Record<Tone, string> = {
  terra: "bg-terra text-linen",
  ink: "bg-ink text-linen",
  linen: "bg-linen text-ink",
  outline: "text-ink ring-1 ring-inset ring-ink/25 hover:ring-ink/60",
  "outline-linen": "text-linen ring-1 ring-inset ring-linen/30 hover:ring-linen/70",
};

const fill: Record<Tone, string> = {
  terra: "bg-ink",
  ink: "bg-terra",
  linen: "bg-sand",
  outline: "bg-ink/[0.06]",
  "outline-linen": "bg-linen/10",
};

export const btnBase =
  "group/btn relative inline-flex min-h-12 items-center justify-center gap-3 overflow-hidden rounded-full pl-6 pr-2 text-[0.95rem] font-semibold tracking-[-0.005em] select-none transition-[transform,box-shadow] duration-150 ease-out active:scale-[0.97] cursor-pointer";

const knob: Record<Tone, string> = {
  terra: "bg-linen text-ink",
  ink: "bg-linen text-ink",
  linen: "bg-ink text-linen",
  outline: "bg-ink text-linen",
  "outline-linen": "bg-linen text-ink",
};

function Inner({ children, tone }: { children: ReactNode; tone: Tone }) {
  return (
    <>
      {/* fill that wipes in from the left on hover (clip-path, GPU only) */}
      <span
        aria-hidden
        className={`absolute inset-0 ${fill[tone]} [clip-path:inset(0_100%_0_0)] transition-[clip-path] duration-500 ease-[var(--ease-out-strong)] group-hover/btn:[clip-path:inset(0_0_0_0)]`}
      />
      <span className="relative z-10">{children}</span>
      <span aria-hidden className={`relative z-10 grid size-8 place-items-center rounded-full ${knob[tone]}`}>
        <svg
          viewBox="0 0 16 16"
          className="size-3.5 transition-transform duration-300 ease-[var(--ease-out-strong)] group-hover/btn:-rotate-45"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2.5 8h11M9 3.5 13.5 8 9 12.5" />
        </svg>
      </span>
    </>
  );
}

export function ButtonLink({
  tone = "terra",
  className = "",
  children,
  ...props
}: ComponentProps<typeof Link> & { tone?: Tone }) {
  return (
    <Link {...props} className={`${btnBase} ${tones[tone]} ${className}`}>
      <Inner tone={tone}>{children}</Inner>
    </Link>
  );
}

export function Button({
  tone = "terra",
  className = "",
  children,
  ...props
}: ComponentProps<"button"> & { tone?: Tone }) {
  return (
    <button {...props} className={`${btnBase} ${tones[tone]} disabled:opacity-60 disabled:pointer-events-none ${className}`}>
      <Inner tone={tone}>{children}</Inner>
    </button>
  );
}
