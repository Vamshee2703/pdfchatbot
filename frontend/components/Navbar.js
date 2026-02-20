import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { logout } from "../utils/auth";

export default function Navbar() {
  const router = useRouter();

  const [isAuth, setIsAuth] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const checkAuth = () => {
      const token = localStorage.getItem("access");
      setIsAuth(!!token);
    };

    // initial check
    checkAuth();

    // re-check auth on route change
    router.events.on("routeChangeComplete", checkAuth);

    return () => {
      router.events.off("routeChangeComplete", checkAuth);
    };
  }, []);

  // prevent hydration mismatch
  if (!mounted) return null;

  return (
    <nav style={styles.nav}>
      <h3 style={styles.logo}>ChatAI</h3>

      <div style={styles.links}>
        {isAuth ? (
          <>
            <Link href="/dashboard" style={styles.link}>
              Dashboard
            </Link>

            <button
              style={styles.logout}
              onClick={() => {
                logout();
                setIsAuth(false);
                router.push("/login");
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login" style={styles.link}>
              Login
            </Link>

            <Link href="/signup" style={styles.link}>
              Signup
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    background: "#111827",
    color: "#ffffff",
    padding: "14px 28px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    margin: 0,
    fontWeight: 600,
  },
  links: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
  },
  link: {
    color: "#e5e7eb",
    textDecoration: "none",
    fontWeight: 500,
  },
  logout: {
    background: "#ef4444",
    color: "#ffffff",
    border: "none",
    padding: "8px 14px",
    borderRadius: "6px",
    cursor: "pointer",
  },
};