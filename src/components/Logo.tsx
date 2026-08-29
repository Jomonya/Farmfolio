export function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <img
      src="/images/site/logo.png"
      alt="FarmFolio logo"
      className={`${className} object-contain`}
    />
  );
}
