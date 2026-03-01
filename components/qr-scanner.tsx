"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Camera, X } from "lucide-react";

interface QrScannerProps {
  onScan: (token: string) => void;
  scanning: boolean;
  onToggle: () => void;
}

export function QrScanner({ onScan, scanning, onToggle }: QrScannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<import("html5-qrcode").Html5Qrcode | null>(null);
  const [error, setError] = useState("");

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        if (state === 2) {
          await scannerRef.current.stop();
        }
      } catch {
        // ignore
      }
      scannerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!scanning) {
      stopScanner();
      return;
    }

    let cancelled = false;

    async function startScanner() {
      const { Html5Qrcode } = await import("html5-qrcode");
      if (cancelled) return;

      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      try {
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            onScan(decodedText);
          },
          () => {}
        );
      } catch (err) {
        if (!cancelled) {
          setError("Tidak dapat mengakses kamera. Pastikan izin kamera aktif.");
          console.error(err);
        }
      }
    }

    startScanner();

    return () => {
      cancelled = true;
      stopScanner();
    };
  }, [scanning, onScan, stopScanner]);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium text-foreground">Scan QR dari Dosen</p>

      {!scanning ? (
        <button
          onClick={onToggle}
          className="flex h-48 w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 transition-all hover:border-primary/50 active:scale-[0.99]"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Camera className="h-6 w-6 text-primary" />
          </div>
          <span className="text-sm font-medium text-primary">Tap untuk scan QR</span>
        </button>
      ) : (
        <div className="relative overflow-hidden rounded-2xl border-2 border-primary/30 bg-foreground/5">
          <div id="qr-reader" ref={containerRef} className="w-full" />
          <button
            onClick={() => {
              stopScanner();
              onToggle();
            }}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-foreground/70 text-background"
            aria-label="Tutup scanner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {error && (
        <p className="rounded-xl bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
