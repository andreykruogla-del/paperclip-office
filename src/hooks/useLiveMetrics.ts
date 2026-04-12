"use client";

import { useState, useEffect } from "react";
import type { Metric } from "@/types/metrics";
import { mockMetrics } from "@/lib/mock-data";

export function useLiveMetrics() {
  const [metrics, setMetrics] = useState<Metric[]>([...mockMetrics]);

  useEffect(() => {
    const id = setInterval(() => {
      setMetrics((prev) =>
        prev.map((m) => {
          if (m.label === "Tasks") {
            const v = Math.max(1, parseInt(m.value) + (Math.random() > 0.5 ? 1 : -1));
            return { ...m, value: String(v) };
          }
          if (m.label === "Handoffs") {
            const v = Math.max(0, parseInt(m.value) + (Math.random() > 0.6 ? 1 : 0));
            return { ...m, value: String(v) };
          }
          if (m.label === "Cost") {
            const v = (parseFloat(m.value.replace("$", "")) + Math.random() * 0.05).toFixed(2);
            return { ...m, value: `$${v}` };
          }
          return m;
        })
      );
    }, 2000);

    return () => clearInterval(id);
  }, []);

  return metrics;
}
