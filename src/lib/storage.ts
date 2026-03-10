export const storage = {
  get: async (key: string): Promise<string | null> => {
    if (
      typeof chrome !== "undefined" &&
      chrome.storage &&
      chrome.storage.local
    ) {
      const data = await chrome.storage.local.get([key]);
      return (data[key] as string) || null;
    }
    return localStorage.getItem(key);
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
