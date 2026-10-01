import Link from "next/link";

import { ArrowUpRightIcon } from "./components/lantern/brand";
import { ProductHeader } from "./components/lantern/product-header";
import { SiteFooter } from "./components/lantern/site-footer";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <ProductHeader />
      <main className="info-page flex min-h-[70vh] items-center">
        <section className="info-shell py-20 text-center">
          <p className="lantern-eyebrow">404 · Lost page</p>
          <h1 className="info-display mx-auto">Page not found.</h1>
          <p className="info-lead mx-auto">
            This route does not exist, but the next step is still clear. Return
            home or open the complete fictional demonstration.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link className="lantern-primary-cta" href="/">
              Return home
            </Link>
            <Link className="lantern-secondary-cta" href="/first-day?demo=1">
              Start guided demo <ArrowUpRightIcon className="h-5 w-5" />
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
