import type { ReactNode } from "react";
import ScrollProgress from "./ScrollProgress";
import Header from "./Header";
import Footer from "./Footer";

/** Shared chrome for every sub-page: scroll bar, header, main, footer. */
export default function SiteFrame({ children }: { children: ReactNode }) {
  return (
    <>
      <ScrollProgress />
      <Header />
      <main id="top">{children}</main>
      <Footer />
    </>
  );
}
