import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getToken } from "../utils/auth";
import { logout } from "../utils/auth";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/employee/me/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.status === 401) router.push("/login");
        return res.json();
      })
      .then(setUser);
  }, []);

  if (!user) return <p style={{ padding: 30 }}>Loading...</p>;

  return (
    <div style={{ padding: 30 }}>
      <h1>Dashboard</h1>
      <p><b>Email:</b> {user.email}</p>
      <p><b>Username:</b> {user.username}</p>
    </div>
  );
}
<button
  onClick={() => {
    logout();
    router.push("/login");
  }}
>
  Logout
</button>