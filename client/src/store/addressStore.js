import { create } from "zustand";

export const useAddressStore = create((set) => ({
  addresses: [],
  setAddresses: (addresses) => {
    set({ addresses: Array.isArray(addresses) ? addresses : [] });
  },
}));

export default useAddressStore;
