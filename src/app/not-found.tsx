import { Logo } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section className="grid min-h-[80dvh] place-items-center pt-[var(--header-h)]">
      <div className="container-x flex flex-col items-center text-center">
        <Logo variant="mark" className="size-16 text-olive" decorative />
        <p className="eyebrow mt-10 text-terra">404</p>
        <h1 className="display-lg mt-5 max-w-[14ch]">This page fell out of the box.</h1>
        <p className="lede mt-6 max-w-md text-ink/70">Let us get you back on track.</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/" tone="terra">
            Back to home
          </ButtonLink>
          <ButtonLink href="/products" tone="outline">
            Meet the range
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
