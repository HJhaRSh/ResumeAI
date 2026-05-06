"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BadgeCheck, Upload, Menu, X } from "lucide-react";
import { cn } from "@/components/ui/cn";

export function Navbar() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 50);
  });

  // Close mobile menu on navigation
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0 });
    setIsMobileMenuOpen(false);
  };

  const handleUploadClick = (e: React.MouseEvent) => {
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0 });
      window.dispatchEvent(new CustomEvent('open-upload-dialog'));
      setIsMobileMenuOpen(false);
    }
  };

  const navItems = [
    { label: "Features", id: "features" },
    { label: "How it works", id: "how-it-works" },
    { label: "Privacy", id: "privacy" }
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "fixed top-0 inset-x-0 z-50 flex justify-center py-4 transition-all duration-300",
        scrolled ? "py-2" : "py-4"
      )}
    >
      <div 
        className={cn(
          "flex items-center justify-between w-full max-w-5xl px-4 py-2 mx-4 sm:mx-5 rounded-full transition-all duration-500",
          scrolled || isMobileMenuOpen
            ? "bg-zinc-950/80 border border-white/10 shadow-2xl backdrop-blur-xl" 
            : "bg-transparent border-transparent"
        )}
      >
        {/* Left: Logo */}
        <Link
          href="/"
          onClick={(e) => {
            if (pathname === "/") {
              e.preventDefault();
              scrollToTop();
            }
          }}
          className="group flex items-center gap-2 relative z-50"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-lg ring-1 ring-white/20 transition-transform group-hover:scale-105">
            <BadgeCheck className="h-4 w-4" />
          </div>
          <span className="font-bold tracking-tight text-zinc-100 group-hover:text-white transition-colors">
            ResumeCheck <span className="text-violet-400">AI</span>
          </span>
        </Link>

        {/* Center: Navigation Links (hidden on mobile) */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (pathname !== "/") {
                  router.push(`/#${item.id}`);
                } else {
                  document.getElementById(item.id)?.scrollIntoView();
                }
              }}
              className="text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right: CTA & Mobile Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/"
            onClick={handleUploadClick}
            className="group relative flex items-center gap-2 rounded-full bg-white/10 px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-bold text-white ring-1 ring-white/20 transition-all hover:bg-white/20 hover:ring-white/40"
          >
            <Upload className="h-3.5 w-3.5 text-violet-300 group-hover:-translate-y-0.5 transition-transform" />
            <span className="hidden xs:inline">Upload</span>
            <span className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500/0 via-violet-500/40 to-violet-500/0 opacity-0 blur-sm transition-opacity group-hover:opacity-100" />
          </Link>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex md:hidden h-8 w-8 items-center justify-center rounded-full bg-white/5 text-zinc-400 hover:text-white transition-colors ring-1 ring-white/10"
          >
            {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="absolute top-full left-0 right-0 mt-2 mx-4 p-4 rounded-3xl bg-zinc-900/95 border border-white/10 shadow-2xl backdrop-blur-2xl md:hidden"
            >
              <div className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      if (pathname !== "/") {
                        router.push(`/#${item.id}`);
                      } else {
                        document.getElementById(item.id)?.scrollIntoView();
                      }
                    }}
                    className="w-full text-left px-4 py-3 rounded-2xl text-sm font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
