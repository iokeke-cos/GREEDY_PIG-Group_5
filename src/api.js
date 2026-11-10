const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export async function apiFetch(path, options = {}) {
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch {
    throw new Error(
      "Can't reach the game server. Check your internet and try again."
    );
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    // no JSON body
  }

  if (!response.ok) {
    throw new Error(
      data?.details?.[0]?.message ||
        data?.error ||
        "Something went wrong. Please try again."
    );
  }
  return data;
}