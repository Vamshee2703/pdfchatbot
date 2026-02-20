import { useState } from "react";
import { useRouter } from "next/router";

export default function Signup() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSignup = async () => {
    setError("");
    setSuccess("");

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/signup/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password }),
      }
    );

    if (!res.ok) {
      setError("Signup failed. Check inputs.");
      return;
    }

    setSuccess("Account created. Please login.");
    setTimeout(() => router.push("/login"), 1500);
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-side-image" />

        <div className="auth-form">
          <h2>Employee Signup</h2>

          <input
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            placeholder="Username"
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password (min 8 chars)"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button onClick={handleSignup}>Sign Up</button>

          {error && <p style={{ color: "red" }}>{error}</p>}
          {success && <p style={{ color: "green" }}>{success}</p>}
        </div>
      </div>
    </div>
  );
}