"use client";
import React from "react";
import Footer from "./Footer";
import { usePathname } from "next/navigation";

export default function LayoutWithFooter({ children }: { children: React.ReactNode }) {
  return (
    <>{children}</>
  );
} 