import { create } from "zustand";

const saveAddresses = () => {};

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
  addresses: [],
  setAddresses: (addresses) => set({ addresses: Array.isArray(addresses) ? addresses : [] }),

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
