"use client";

import { usePathname } from "next/navigation";

export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="relative">
      <div className="route-mask" aria-hidden />
      <div className="animate-routeIn">{children}</div>
    </div>
  );
}
