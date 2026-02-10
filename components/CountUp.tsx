"use client";

import { useEffect, useState } from "react";

export default function CountUp({ value }: { value: string }) {
  const numeric = parseInt(value);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (isNaN(numeric)) return;
    let start = 0;
    const interval = setInterval(() => {
      start += Math.ceil(numeric / 20);
      if (start >= numeric) {
        setDisplay(numeric);
        clearInterval(interval);
      } else {
        setDisplay(start);
      }
    }, 20);
    return () => clearInterval(interval);
  }, [numeric]);

  return <>{isNaN(numeric) ? value : display}</>;
}
