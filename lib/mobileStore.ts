import { create } from "zustand";

// ─── 型定義 ───────────────────────────────────────────────

export type Material = {
  id: string;
  title: string;
  description: string;
  level: string[];
  content: string[];
  method: string[];
  ageGroup: string;
  requiredPlan: string;
  pdfFile?: string;
  isPickup: boolean;
  isRecommended: boolean;
  ranking: number | null;
  isNew: boolean;
};

export type Announcement = {
  id: string;
  title: string;
  date: string;
  type: string;
  material_id: string | null;
};

export type AuthMode = "signup" | "login" | "reset-request";

export type Modal =
  | { type: "materials"; filter: { content: string; method: string } }
  | { type: "teaser"; mat: Material }
  | { type: "teaser-plan" }
  | { type: "teaser-purchase" }
  | { type: "auth"; mode: AuthMode }
  | { type: "announcement"; announcement: Announcement }
  | { type: "mypage" }
  | { type: "mypage-profile" }
  | { type: "mypage-plan" }
  | { type: "mypage-billing" }
  | { type: "more-dl" }
  | { type: "more-guide" }
  | { type: "more-purchases" }
  | { type: "legal-privacy" }
  | { type: "legal-terms" }
  | { type: "legal-tokushoho" }
  | { type: "legal-about" }
  | { type: "guest" };

// ─── Store ────────────────────────────────────────────────

interface MobileStore {
  modalStack: Modal[];
  push: (modal: Modal) => void;
  pop: () => void;
  reset: () => void;
  updateMaterialsFilter: (content: string, method: string) => void;
}

export const useMobileStore = create<MobileStore>((set) => ({
  modalStack: [],

  push: (modal) =>
    set((state) => ({ modalStack: [...state.modalStack, modal] })),

  pop: () =>
    set((state) => ({ modalStack: state.modalStack.slice(0, -1) })),

  reset: () => set({ modalStack: [] }),

  updateMaterialsFilter: (content, method) =>
    set((state) => ({
      modalStack: state.modalStack.map((m) =>
        m.type === "materials" ? { ...m, filter: { content, method } } : m
      ),
    })),
}));

// ─── ヘルパー ─────────────────────────────────────────────

/** スタックから特定タイプのエントリを取得 */
export function findModal<T extends Modal["type"]>(
  stack: Modal[],
  type: T
): Extract<Modal, { type: T }> | undefined {
  return stack.find((m) => m.type === type) as Extract<Modal, { type: T }> | undefined;
}
