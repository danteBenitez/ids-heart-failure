import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { PatientCase } from "@/lib/types";
import { seedPatients } from "@/lib/seed-data";

// ---------------------------------------------------------------------------
// Store de pacientes – Zustand con persistencia en localStorage
//
// Este store es la fuente de verdad reactiva de la app. Los componentes
// leen datos de acá y se re-renderizan automáticamente ante cambios.
//
// Los métodos internos (_setPatients, _addPatient, _updatePatient) NO deben
// ser llamados por los componentes directamente. La interfaz pública es
// el PatientService (src/services/patient-service.ts).
// ---------------------------------------------------------------------------

const STORAGE_KEY = "ids-hf:patients";

// ── Tipos del store ────────────────────────────────────────────────────

type PatientState = {
  patients: PatientCase[];
  isHydrated: boolean;
};

type PatientActions = {
  /** Reemplaza la lista completa de pacientes. */
  _setPatients: (patients: PatientCase[]) => void;
  /** Agrega un paciente nuevo al final de la lista. */
  _addPatient: (patient: PatientCase) => void;
  /** Actualiza parcialmente un paciente existente por ID. */
  _updatePatient: (id: string, data: Partial<PatientCase>) => void;
};

export type PatientStore = PatientState & PatientActions;

// ── Creación del store ─────────────────────────────────────────────────

export const usePatientStore = create<PatientStore>()(
  persist(
    (set) => ({
      // ── Estado inicial (SSR y antes de hidratación) ──────────────
      patients: [],
      isHydrated: false,

      // ── Acciones internas ────────────────────────────────────────
      _setPatients: (patients) => set({ patients }),

      _addPatient: (patient) =>
        set((state) => ({ patients: [...state.patients, patient] })),

      _updatePatient: (id, data) =>
        set((state) => ({
          patients: state.patients.map((p) =>
            p.id === id ? { ...p, ...data } : p,
          ),
        })),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),

      // Solo persistimos los pacientes; isHydrated y las acciones
      // son transitorias y no deben ir al localStorage.
      partialize: (state) => ({ patients: state.patients }),

      // Callback que se ejecuta al finalizar la rehidratación desde
      // localStorage. Si no hay datos guardados, inyecta la semilla.
      onRehydrateStorage: () => {
        return (_state, error) => {
          if (error) {
            console.error(
              "Error al rehidratar el store de pacientes:",
              error,
            );
          }

          // Después de que persist haya mergeado, revisamos el estado real
          const { patients } = usePatientStore.getState();

          if (patients.length === 0) {
            // localStorage estaba vacío → cargar datos semilla
            usePatientStore.setState({ patients: seedPatients });
          }

          // Marcar como hidratado para que los componentes dejen de
          // mostrar el skeleton y rendericen los datos reales.
          usePatientStore.setState({ isHydrated: true });
        };
      },
    },
  ),
);
