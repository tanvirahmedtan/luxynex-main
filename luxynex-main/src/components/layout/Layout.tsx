import Header from "./Header";
import Footer from "./Footer";
import BottomNavigation from "./BottomNavigation";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const isMobile = useIsMobile();
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className={isMobile ? "pb-20" : ""}>{children}</main>
      <Footer />
      <BottomNavigation />
    </div>
  );
}
