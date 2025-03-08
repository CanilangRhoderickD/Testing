
import React from "react";
import { Link as WouterLink, useLocation } from "wouter";

interface LinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  activeClassName?: string;
}

export function Link({ href, children, className = "", activeClassName = "" }: LinkProps) {
  const [location] = useLocation();
  const isActive = location === href;
  
  return (
    <WouterLink 
      href={href}
      className={`${className} ${isActive ? activeClassName : ""}`}
    >
      {children}
    </WouterLink>
  );
}
