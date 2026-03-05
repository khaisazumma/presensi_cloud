"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react";
import { setUserId } from "@/lib/device";

export default function MahasiswaLoginPage() {
  const router = useRouter();
  const [nim, setNim] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!nim.trim() || !password.trim()) {
      setError("NIM dan password harus diisi");
      return;
    }

    setIsLoading(true);

    try {
      // simulasi loading biar terasa real
      await new Promise((resolve) => setTimeout(resolve, 800));

      // simpan NIM sebagai user_id
      setUserId(nim);

      router.push("/mahasiswa");
    } catch (err) {
      setError("Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-b from-primary/5 to-background px-4 py-8">
      <div className="flex w-full max-w-md flex-col gap-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-border hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-primary">Login Mahasiswa</h1>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          {error && (
            <div className="rounded-xl bg-destructive/10 border border-destructive/30 p-3 text-sm font-medium text-destructive">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold">
              Nomor Induk Mahasiswa (NIM)
            </label>
            <input
              type="text"
              placeholder="Contoh: 081211833001"
              value={nim}
              onChange={(e) => setNim(e.target.value)}
              disabled={isLoading}
              className="h-12 rounded-xl border px-4"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full h-12 rounded-xl border px-4 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 h-12 w-full rounded-xl bg-primary text-white font-semibold flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          Gunakan NIM dan password akun akademik Anda
        </p>
      </div>
    </main>
  );
}
