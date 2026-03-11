export const storage = {
  get: async (key: string): Promise<string | null> => {
    let value: string | null = null;

    if (
      typeof chrome !== "undefined" &&
      chrome.storage &&
      chrome.storage.local
    ) {
      const data = await chrome.storage.local.get([key]);
      value = (data[key] as string) || null;
    } else {
      value = localStorage.getItem(key);
    }

    // Se o valor for o JWT de autenticação ("token"), validaremos a expiração
    if (key === "token" && value) {
      try {
        const parts = value.split(".");
        // Um JWT comum tem 3 partes separadas por ponto
        if (parts.length === 3) {
          const payloadBase64 = parts[1];
          const base64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
          // Decodifica Base64 de forma segura lidando com caracteres especiais (UTF-8)
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split("")
              .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
              .join("")
          );

          const payload = JSON.parse(jsonPayload);

          if (payload.exp) {
            const currentTime = Math.floor(Date.now() / 1000);
            // Se expirou
            if (payload.exp < currentTime) {
              await storage.remove(key); // Remove automaticamente
              return null;
            }
          }
        }
      } catch (error) {
        // Se a validação e o decode falharem (token corrompido ou formato inválido), nós também dropamos
        console.warn("Token JWT inválido ou corrompido decodificado no storage.");
        await storage.remove(key);
        return null;
      }
    }

    return value;
  },

  set: async (key: string, value: string): Promise<void> => {
    if (
      typeof chrome !== "undefined" &&
      chrome.storage &&
      chrome.storage.local
    ) {
      await chrome.storage.local.set({ [key]: value });
    } else {
      localStorage.setItem(key, value);
    }
  },

  remove: async (key: string): Promise<void> => {
    if (
      typeof chrome !== "undefined" &&
      chrome.storage &&
      chrome.storage.local
    ) {
      await chrome.storage.local.remove([key]);
    } else {
      localStorage.removeItem(key);
    }
  },
};
