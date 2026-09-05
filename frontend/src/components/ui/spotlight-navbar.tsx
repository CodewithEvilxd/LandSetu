import React, { useEffect, useRef, useState } from "react";
import { animate } from "framer-motion";
import { cn } from "../../lib/utils.js";
import "../../styles/spotlight-navbar.css";

export interface NavItem {
  label: string;
  href: string;
}

export interface SpotlightNavbarProps {
  items?: NavItem[];
  className?: string;
  onItemClick?: (item: NavItem, index: number) => void;
  defaultActiveIndex?: number;
  controlledActiveIndex?: number;
}

export function SpotlightNavbar({
  items = [
    { label: "Home", href: "#home" },
    { label: "About", href: "#about" },
    { label: "Events", href: "#events" },
    { label: "Sponsors", href: "#sponsors" },
    { label: "Pricing", href: "#pricing" },
  ],
  className,
  onItemClick,
  defaultActiveIndex = 0,
  controlledActiveIndex,
}: SpotlightNavbarProps) {
  const navRef = useRef<HTMLDivElement>(null);
  const [internalActiveIndex, setInternalActiveIndex] = useState(defaultActiveIndex);
  const activeIndex = controlledActiveIndex !== undefined ? controlledActiveIndex : internalActiveIndex;
  const [hoverX, setHoverX] = useState<number | null>(null);

  // Refs for the light positions for imperative physics animation
  const spotlightX = useRef(0);
  const ambienceX = useRef(0);

  // Spotlight follows mouse with instant snappy tracking
  useEffect(() => {
    if (!navRef.current) return;
    const nav = navRef.current;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = nav.getBoundingClientRect();
      const x = e.clientX - rect.left;
      setHoverX(x);
      spotlightX.current = x;
      nav.style.setProperty("--spotlight-x", `${x}px`);
    };

    const handleMouseLeave = () => {
      setHoverX(null);
      // When mouse leaves, spring spotlight back to active item
      const activeItem = nav.querySelector(`[data-index="${activeIndex}"]`);
      if (activeItem) {
        const navRect = nav.getBoundingClientRect();
        const itemRect = activeItem.getBoundingClientRect();
        const targetX = itemRect.left - navRect.left + itemRect.width / 2;
        animate(spotlightX.current, targetX, {
          type: "spring",
          stiffness: 200,
          damping: 20,
          onUpdate: (v) => {
            spotlightX.current = v;
            nav.style.setProperty("--spotlight-x", `${v}px`);
          },
        });
      }
    };

    nav.addEventListener("mousemove", handleMouseMove);
    nav.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      nav.removeEventListener("mousemove", handleMouseMove);
      nav.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [activeIndex]);

  // Ambience light smoothly animates to active item
  useEffect(() => {
    if (!navRef.current) return;
    const nav = navRef.current;
    const activeItem = nav.querySelector(`[data-index="${activeIndex}"]`);
    if (activeItem) {
      const navRect = nav.getBoundingClientRect();
      const itemRect = activeItem.getBoundingClientRect();
      const targetX = itemRect.left - navRect.left + itemRect.width / 2;
      animate(ambienceX.current, targetX, {
        type: "spring",
        stiffness: 200,
        damping: 20,
        onUpdate: (v) => {
          ambienceX.current = v;
          nav.style.setProperty("--ambience-x", `${v}px`);
        },
      });
    }
  }, [activeIndex]);

  const handleItemClick = (item: NavItem, index: number) => {
    setInternalActiveIndex(index);
    onItemClick?.(item, index);
  };

  return (
    <div className={cn("spotlight-nav-wrapper", className)}>
      <nav
        ref={navRef}
        className="spotlight-nav"
      >
        {/* Navigation Items List */}
        <ul className="spotlight-nav-list">
          {items.map((item, idx) => (
            <li key={idx} className="spotlight-nav-item">
              <a
                href={item.href}
                data-index={idx}
                onClick={(e) => {
                  e.preventDefault();
                  handleItemClick(item, idx);
                }}
                className={cn(
                  "spotlight-nav-link",
                  activeIndex === idx && "active"
                )}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Lighting Layer 1: The Moving Spotlight (Follows mouse cursor) */}
        <div
          className="spotlight-nav-spotlight"
          style={{
            opacity: hoverX !== null ? 1 : 0,
            background: `radial-gradient(120px circle at var(--spotlight-x, 50%) 100%, var(--spotlight-color, rgba(0,0,0,0.08)) 0%, transparent 50%)`,
          }}
        />

        {/* Lighting Layer 2: The Active State Ambience (Smooth underline light) */}
        <div
          className="spotlight-nav-ambience"
          style={{
            background: `radial-gradient(60px circle at var(--ambience-x, 50%) 0%, var(--ambience-color, rgba(17,24,39,0.95)) 0%, transparent 100%)`,
          }}
        />
      </nav>
    </div>
  );
}

export default SpotlightNavbar;
