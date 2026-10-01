import Nav from "@/components/nav";
import TopBar from "@/components/top-bar";
import Footer from "@/components/footer";
import { businessJsonLd } from "@/lib/seo";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(businessJsonLd) }}
      />
      <TopBar />
      <Nav />
      <main className="flex flex-1 flex-col">{children}</main>
      <Footer />
    </>
  );
}
