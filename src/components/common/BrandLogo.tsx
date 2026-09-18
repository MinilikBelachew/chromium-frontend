import { Link } from "@/i18n/navigation";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

export default function BrandLogo({
  href = "/",
  size = 36,
  className,
}: {
  href?: string | null;
  size?: number;
  className?: string;
}) {
  const mark = (
    <span
      className={cn("relative inline-flex shrink-0 overflow-hidden rounded-full bg-black dark:bg-black", className)}
      style={{ width: size, height: size }}
    >
      <img
        src={BRAND.logoLight}
        alt={BRAND.name}
        width={size}
        height={size}
        className="h-full w-full object-cover dark:hidden"
      />
      <img
        src={BRAND.logoDark}
        alt=""
        width={size}
        height={size}
        className="hidden h-full w-full object-cover dark:block"
      />
    </span>
  );

  if (!href) return mark;

  return (
    <Link href={href} aria-label={BRAND.name} className="inline-flex shrink-0">
      {mark}
    </Link>
  );
}
