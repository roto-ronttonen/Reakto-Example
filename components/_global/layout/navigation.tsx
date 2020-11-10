import Link from "next/link";
import React from "react";

export default function Navigation() {
  return (
    <nav>
      <Link href="/jackets">
        <a>Jackets</a>
      </Link>
      <Link href="/shirts">
        <a>Shirts</a>
      </Link>
      <Link href="/accessories">
        <a>Accessories</a>
      </Link>
      <style jsx>{`
        nav {
          position: fixed;
          height: 48px;
          background-color: white;
          display: flex;
          align-items: center;
          width: 100%;
          border-bottom: 1px solid gray;
        }
        a {
          padding: 16px;
          cursor: pointer;
        }
      `}</style>
    </nav>
  );
}
