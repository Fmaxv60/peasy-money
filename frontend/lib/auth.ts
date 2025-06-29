export async function fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem("token")
    if (!token) {
      throw new Error("Token manquant")
    }
  
    const res = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
  
    if (res.status === 401) {
      localStorage.removeItem("token")
      window.location.href = "/login"
      throw new Error("Token expiré")
    }
  
    if (!res.ok) {
      throw new Error(`Erreur API : ${res.statusText}`)
    }
  
    return res
  }
  