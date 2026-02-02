import React, { useEffect, useState } from "react";
import { Link } from "react-router";

const Navbar = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const dark =
      document.documentElement.classList.contains("dark") ||
      (typeof localStorage !== "undefined" && localStorage.getItem("theme") === "dark");
    setIsDark(dark);
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("theme", nextDark ? "dark" : "light");
    }
    if (nextDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <nav className="navbar">
      <Link to="/">
        <p className="text-2xl font-bold text-gradient">RESUME ANALYZER</p>
      </Link>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
        <Link to="/upload" className="primary-button w-fit">
          Upload Resume
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
