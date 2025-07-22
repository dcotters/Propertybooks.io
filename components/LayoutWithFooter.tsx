"use client";
import React from "react";
import Footer from "./Footer";
import { usePathname } from "next/navigation";

export default function LayoutWithFooter({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // List of routes where the footer should be shown
  const showFooterRoutes = [
    "/", "/pricing", "/calculator", "/about", "/faq", "/contact", "/terms", "/privacy"
  ];
  const showFooter = showFooterRoutes.includes(pathname);
  return (
    <>
      {children}
      {showFooter && <Footer />}
    </>
  );
} 