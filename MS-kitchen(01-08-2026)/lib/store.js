import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useFormStore = create(
    persist(
        (set, get) => ({
            // Generic Page State
            forms: {},
            
            // Set form data for a specific page
            setFormData: (pageKey, data) => set((state) => {
                const currentPageData = state.forms[pageKey] || {};
                return {
                    forms: {
                        ...state.forms,
                        [pageKey]: { 
                            ...currentPageData, 
                            ...data 
                        }
                    }
                };
            }),

            // Get form data for a specific page
            getFormData: (pageKey, defaultData) => {
                const state = get();
                return state.forms[pageKey] || defaultData;
            },

            // Clear form data for a specific page
            clearFormData: (pageKey) => set((state) => {
                const newForms = { ...state.forms };
                delete newForms[pageKey];
                return { forms: newForms };
            }),

            // Clear all forms
            clearAllForms: () => set({ forms: {} })
        }),
        {
            name: 'ms-kitchen-persistent-forms',
            storage: createJSONStorage(() => localStorage),
        }
    )
);

