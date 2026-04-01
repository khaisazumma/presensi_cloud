"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Send } from "lucide-react";

// Components
import { QrScanner } from "@/components/qr-scanner";
import { StatusBadge } from "@/components/status-badge";
import { GpsCard } from "@/components/gps-card";
import { LocationMap } from "@/components/location-map";
import { AccelerometerCard } from "@/components/accelerometer-card";

// API
import {
  postGps,
  postAccel,
  checkin,
  getPresenceStatus,
  loginMahasiswa,
} from "@/lib/api";

import { getDeviceId, setUserId } from "@/lib/device";

export default function MahasiswaPage() {
  const router = useRouter();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [nim, setNim] = useState("");
  const [activeTab, setActiveTab] = useState<"scan" | "gps" | "accel">("scan");

  const [status, setStatus] = useState<string | null>(null);
  const [gpsData, setGpsData] = useState<any>(null);
  const [gpsHistory] = useState<any[]>([]);
  const [accelSamples, setAccelSamples] = useState<any[]>([]);
  const [accelLatest] = useState<any>(null);

  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ================= LOGIN =================
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await loginMahasiswa(nim, "");

      if (res.ok) {
        setUserId(res.data.user_id);
        setIsLoggedIn(true);
      } else {
        setError(res.error || "Login gagal");
      }
    } catch {
      setError("Terjadi kesalahan");
    }

    setLoading(false);
  }

  // ================= GPS =================
  function getGps(): Promise<GeolocationCoordinates> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve(pos.coords),
        (err) => reject(err),
        { enableHighAccuracy: true },
      );
    });
  }

  async function handleGpsManual() {
    const pos = await getGps();

    const gps = {
      lat: pos.latitude,
      lng: pos.longitude,
      accuracy_m: Math.round(pos.accuracy),
    };

    setGpsData(gps);
    await postGps(getDeviceId(), gps.lat, gps.lng, gps.accuracy_m);
  }

  // ================= ACCEL =================
  async function handleAccelManual() {
    try {
      // ✅ iOS permission fix
      if (
        typeof DeviceMotionEvent !== "undefined" &&
        typeof (DeviceMotionEvent as any).requestPermission === "function"
      ) {
        const permission = await (DeviceMotionEvent as any).requestPermission();
        if (permission !== "granted") {
          alert("Izin sensor ditolak");
          return;
        }
      }

      const samples: any[] = [];

      function handler(e: DeviceMotionEvent) {
        const a = e.accelerationIncludingGravity;
        if (a) {
          samples.push({
            t: new Date().toISOString(),
            x: a.x || 0,
            y: a.y || 0,
            z: a.z || 0,
          });
        }
      }

      window.addEventListener("devicemotion", handler);

      setTimeout(async () => {
        window.removeEventListener("devicemotion", handler);

        if (samples.length === 0) {
          alert("Data gerakan tidak terbaca");
          return;
        }

        setAccelSamples(samples);
        await postAccel(getDeviceId(), samples);
      }, 3000);
    } catch (err) {
      console.error(err);
      alert("Sensor tidak didukung di device ini");
    }
  }

  // ================= SCAN =================
  const handleScan = useCallback(
    async (token: string) => {
      setLoading(true);

      try {
        const deviceId = getDeviceId();

        // GPS
        const pos = await getGps();
        await postGps(deviceId, pos.latitude, pos.longitude, pos.accuracy);

        // ACCEL
        const samples = [
          {
            t: new Date().toISOString(),
            x: 0,
            y: 0,
            z: 9.8,
          },
        ];
        await postAccel(deviceId, samples);

        // CHECKIN
        await checkin({
          user_id: nim,
          device_id: deviceId,
          qr_token: token,
          course_id: "from-token",
          session_id: "from-token",
        });

        // STATUS
        const statusRes = await getPresenceStatus(
          nim,
          "from-token",
          "from-token",
        );

        if (statusRes.ok) {
          setStatus(statusRes.data.status);
        }
      } catch (err) {
        console.error(err);
        setError("Gagal proses scan");
      } finally {
        setLoading(false);
      }
    },
    [nim],
  );
  return (
    <main className="min-h-screen bg-background">
      {/* HEADER */}
      <header className="p-4 border-b flex items-center gap-3">
        <button onClick={() => router.push("/")}>
          <ArrowLeft />
        </button>
        <h1 className="font-bold">Presensi Mahasiswa</h1>
      </header>

      <div className="p-4 max-w-md mx-auto">
        {/* LOGIN */}
        {!isLoggedIn && (
          <form onSubmit={handleLogin} className="flex flex-col gap-3">
            <input
              value={nim}
              onChange={(e) => setNim(e.target.value)}
              placeholder="Masukkan NIM"
              className="border p-3 rounded-xl"
            />
            <button className="bg-primary text-white p-3 rounded-xl">
              {loading ? "Loading..." : "Login"}
            </button>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </form>
        )}

        {/* MAIN */}
        {isLoggedIn && (
          <>
            {/* TABS */}
            <div className="flex gap-2 mb-4">
              {["scan", "gps", "accel"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`flex-1 p-2 rounded-xl ${
                    activeTab === tab ? "bg-primary text-white" : "bg-secondary"
                  }`}
                >
                  {tab.toUpperCase()}
                </button>
              ))}
            </div>

            {/* STATUS */}
            {status && <StatusBadge status={status} />}

            {/* SCAN */}
            {activeTab === "scan" && (
              <div className="space-y-4">
                <QrScanner
                  onScan={handleScan}
                  scanning={scanning}
                  onToggle={() => setScanning(!scanning)}
                />

                <button
                  onClick={() => setScanning(!scanning)}
                  className="w-full bg-primary text-white p-3 rounded-xl flex items-center justify-center gap-2"
                >
                  <Send /> Scan QR
                </button>
              </div>
            )}

            {/* GPS */}
            {activeTab === "gps" && (
              <div className="space-y-4">
                <GpsCard data={gpsData} />

                <button
                  onClick={handleGpsManual}
                  className="w-full bg-primary text-white p-3 rounded-xl"
                >
                  Ambil GPS
                </button>

                {gpsData && (
                  <button
                    onClick={() =>
                      window.open(
                        `https://maps.google.com?q=${gpsData.lat},${gpsData.lng}`,
                      )
                    }
                    className="w-full border p-3 rounded-xl"
                  >
                    Open Maps
                  </button>
                )}

                <LocationMap latest={gpsData} history={gpsHistory} />
              </div>
            )}

            {/* ACCEL */}
            {activeTab === "accel" && (
              <div className="space-y-4">
                <AccelerometerCard
                  latest={accelLatest}
                  samples={accelSamples}
                />

                {/* 🔥 TOMBOL FIX */}
                <button
                  onClick={handleAccelManual}
                  className="w-full bg-primary text-white p-3 rounded-xl relative z-50"
                >
                  Ambil Data Gerak
                </button>
              </div>
            )}

            {/* LOADING */}
            {loading && (
              <div className="flex justify-center mt-4">
                <Loader2 className="animate-spin" />
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
