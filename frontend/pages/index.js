import { useEffect } from "react";
import { useRouter } from "next/router";
import { isLoggedIn } from "../utils/auth";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push(isLoggedIn() ? "/home" : "/login");
  }, []);

  return null;
}
