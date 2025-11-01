"use client";
import { useState, useEffect } from "react";
import { OkrHeader } from "./OkrHeader";

export default function OkrsPage() {
  const [okrs, setOkrs] = useState<Okrs[]>([]);
  const [period, setPeriod] = useState<string>("Q1 2024");

  useEffect(() => {
    (async () => {
      try {
        setOkrs(await fetchOkrs());
      } catch (e: any) {
        console.error(e);
      }
    })();
  },
  return (
    <OkrHeader okrs={okrs}
            year={year}
            period={period}
            onChangePeriod={setPeriod}/>
  )
}
