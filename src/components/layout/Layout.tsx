import { ReactNode } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

interface LayoutProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Layout({
  children,
  currentPage,
  onNavigate,
}: LayoutProps) {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar onNavigate={onNavigate} />
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} />

      <main className="pt-16 lg:pl-60 pl-0">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
