import { create } from 'zustand'

let toastId = 0

export const useAppStore = create((set) => ({
  activeTab: 'inventory',
  setActiveTab: (tab) => set({ activeTab: tab }),

  inventoryVersion: 0,
  invalidateInventory: () => set((s) => ({ inventoryVersion: s.inventoryVersion + 1 })),

  toasts: [],
  addToast: (message, type = 'info') => {
    const id = ++toastId
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }))
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
    }, 3500)
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))
