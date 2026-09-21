import { create } from "zustand";

const STORAGE_KEY = "occasion_addresses";

const loadInitialAddresses = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Failed to load addresses from localStorage:", error);
    return [];
  }
};

const saveAddresses = (addresses) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(addresses));
  } catch (error) {
    console.error("Failed to save addresses to localStorage:", error);
  }
};

export const emptyAddress = {
  label: "",
  firstName: "",
  lastName: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  location: "Thailand",
};

const makeId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `addr-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

export const useAddressStore = create((set, get) => ({
  addresses: loadInitialAddresses(),

  addAddress: (address) => {
    const item = {
      id: makeId(),
      isDefault: get().addresses.length === 0,
      ...emptyAddress,
      ...address,
    };
    const updated = [...get().addresses, item];
    saveAddresses(updated);
    set({ addresses: updated });
    return item;
  },

  updateAddress: (id, patch) => {
    const updated = get().addresses.map((addr) =>
      addr.id === id ? { ...addr, ...patch } : addr
    );
    saveAddresses(updated);
    set({ addresses: updated });
    return updated;
  },

  removeAddress: (id) => {
    let updated = get().addresses.filter((addr) => addr.id !== id);
    if (updated.length > 0 && !updated.some((addr) => addr.isDefault)) {
      updated = updated.map((addr, index) =>
        index === 0 ? { ...addr, isDefault: true } : addr
      );
    }
    saveAddresses(updated);
    set({ addresses: updated });
    return updated;
  },

  setDefaultAddress: (id) => {
    const updated = get().addresses.map((addr) => ({
      ...addr,
      isDefault: addr.id === id,
    }));
    saveAddresses(updated);
    set({ addresses: updated });
    return updated;
  },
}));

export default useAddressStore;