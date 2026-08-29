"use client";

import Link from "next/link";
import { useEffect } from "react";

export function LegacyRedirect({ destination }: { destination: string }) {
  useEffect(() => {
    window.location.replace(destination);
  }, [destination]);

  return (
    <section className="shell listing-page">
      <meta httpEquiv="refresh" content={`0; url=${destination}`} />
      <p className="kicker">نشانی تازه</p>
      <h1>این صفحه جابه‌جا شده است</h1>
      <p className="lead">اگر انتقال خودکار انجام نشد، از پیوند زیر وارد نشانی تازه شوید.</p>
      <Link className="read-all-commentary" href={destination}>رفتن به صفحه تازه ←</Link>
    </section>
  );
}
