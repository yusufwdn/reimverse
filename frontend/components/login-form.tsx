"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Mock successful login response
      // const data: {
      //   token:string,
      //   user: {
      //     id: string,
      //     email: string,
      //     role: "employee" | "manager" | "admin",
      //     name: string
      //   }
      // } = {
      //   token: "mock-jwt-token-12345",
      //   user: {
      //     id: "1",
      //     email: email,
      //     role: "admin", // employee, manager, atau admin
      //     name: `${email.charAt(0).toUpperCase() + email.slice(1)} User`
      //   }
      // }

      // console.log("Login response:", data)

      // Store token and user info
      login(data.token, data.user);

      // console.log("After login, user role:", data.user.role)

      // Redirect based on user role
      switch (data.user.role) {
        case "employee":
          console.log("redirect to /dashboard/employee");
          router.push("/dashboard/employee");
          break;
        case "manager":
          console.log("redirect to /dashboard/manager");
          router.push("/dashboard/manager");
          break;
        case "admin":
          console.log("redirect to /dashboard/admin");
          router.push("/dashboard/admin");
          break;
        default:
          console.log("redirect to /dashboard/employee");
          router.push("/dashboard/employee");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred during login"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // For demo purposes, let's add quick login buttons
  const handleQuickLogin = (role: string) => {
    // This is just for demonstration
    const demoCredentials = {
      employee: { email: "employee@example.com", password: "password" },
      manager: { email: "manager@example.com", password: "password" },
      admin: { email: "admin@example.com", password: "password" },
    };

    setEmail(demoCredentials[role as keyof typeof demoCredentials].email);
    setPassword(demoCredentials[role as keyof typeof demoCredentials].password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="mail" className="form-label">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="form-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="password" className="form-label">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="form-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {error && <div className="form-error">{error}</div>}

      <div>
        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </button>
      </div>

      {/* Demo quick login buttons - remove in production */}
      <div className="pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-500 mb-2">Demo Quick Login:</p>
        <div className="flex space-x-2">
          <button
            type="button"
            className="btn btn-secondary text-xs py-1"
            onClick={() => handleQuickLogin("employee")}
          >
            Employee
          </button>
          <button
            type="button"
            className="btn btn-secondary text-xs py-1"
            onClick={() => handleQuickLogin("manager")}
          >
            Manager
          </button>
          <button
            type="button"
            className="btn btn-secondary text-xs py-1"
            onClick={() => handleQuickLogin("admin")}
          >
            Admin
          </button>
        </div>
      </div>
    </form>
  );
}
