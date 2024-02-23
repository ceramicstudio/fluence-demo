// Navbar.js
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { isMobile } from "react-device-detect";

const Navbar = () => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="w-full border-b border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <Link
            href="/"
            className="text-white transition duration-300 hover:text-gray-300"
          >
            <div className="flex flex-col items-center">
              <span className="flex flex-row">
                <div className="aspect-square">
                  <Image
                    src="https://developers.ceramic.network/img/logo.svg"
                    width={30}
                    height={30}
                    alt="Ceramic Logo"
                  />
                </div>
                <div className="flex flex-col">
                  <div className="ml-3 text-lg font-bold text-white">
                    EthDenver &apos;24 Scavenger Hunt
                  </div>
                  <div className="ml-3 text-sm text-white">
                    Presented by Ceramic and Fluence
                  </div>
                </div>
              </span>
              <div className="ml-0 mt-4 flex w-full flex-row content-start">
                <w3m-button size="sm" balance="hide" />
              </div>
            </div>
          </Link>
        </div>
        {/* Navbar links for medium and larger screens */}
        <div className="hidden space-x-4 md:flex">
          <a
            href="/leaderboard"
            className="text-white transition duration-300 hover:text-gray-300"
          >
            Leaderboard
          </a>
          <a
            href="/events"
            className="text-white transition duration-300 hover:text-gray-300"
          >
            Events
          </a>
        </div>

        {/* Mobile menu button for small screens */}
        <div className="flex flex-row md:hidden">
          <div>
            {/* Add your mobile menu button, for example, using a hamburger icon */}
            <button className="text-white" onClick={toggleMobileMenu}>
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16m-7 6h7"
                ></path>
              </svg>
            </button>
          </div>

          {/* Mobile menu for small screens */}
          {isMobileMenuOpen && (
            <div className="relative md:hidden ">
              <div className="items-left flex flex-col space-y-4 rounded-lg bg-white/10 bg-opacity-30 p-4 text-white backdrop-blur-lg backdrop-filter">
                {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                <a
                  href="/"
                  className="text-white transition duration-300 hover:text-gray-300"
                >
                  Home
                </a>
                <a
                  href="/leaderboard"
                  className="text-white transition duration-300 hover:text-gray-300"
                >
                  Leaderboard
                </a>
                <a
                  href="/events"
                  className="text-white transition duration-300 hover:text-gray-300"
                >
                  Events
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
