export function getDeviceId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("device_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("device_id", id);
  }
  return id;
}

export function getUserId(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("user_id") ?? "";
}

export function setUserId(id: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("user_id", id);
  }
}
