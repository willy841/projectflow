"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { vendorProfiles, type VendorBasicProfile } from "@/components/vendor-data";

const STORAGE_KEY = "projectflow-vendors";

export const DEFAULT_TRADE_OPTIONS = ["輸出", "木作", "施工", "平面輸出", "大圖輸出", "活動佈置", "燈光", "音響", "視覺製作", "道具", "金工", "壓克力", "招牌"];
const TRADE_OPTIONS_STORAGE_KEY = "projectflow-vendor-trade-options";

export type QuickCreateVendorInput = {
  name: string;
  tradeLabel?: string;
};

type VendorStoreContextValue = {
  vendors: VendorBasicProfile[];
  tradeOptions: string[];
  isReady: boolean;
  createVendor: (input: QuickCreateVendorInput) => { ok: true; vendor: VendorBasicProfile } | { ok: false; reason: "duplicate"; vendor: VendorBasicProfile };
  updateVendor: (id: string, patch: Partial<VendorBasicProfile>) => void;
  deleteVendor: (id: string) => void;
  addTradeOption: (trade: string) => void;
  removeTradeOption: (trade: string) => void;
  getVendorById: (id: string) => VendorBasicProfile | undefined;
  getVendorByName: (name: string) => VendorBasicProfile | undefined;
};

const VendorStoreContext = createContext<VendorStoreContextValue | null>(null);

function slugifyVendorName(name: string) {
  const normalized = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || `vendor-${Date.now()}`;
}

function withDefaultTrade(vendor: VendorBasicProfile): VendorBasicProfile {
  const tradeLabel = vendor.tradeLabel ?? vendor.tradeLabels?.[0] ?? vendor.category ?? "待補充";
  return {
    ...vendor,
    tradeLabel,
    category: tradeLabel,
  };
}

function getDefaultVendors() {
  return vendorProfiles.map(withDefaultTrade);
}

function readStoredVendors() {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as VendorBasicProfile[];
    if (!Array.isArray(parsed) || !parsed.length) return null;
    return parsed.map(withDefaultTrade);
  } catch {
    return null;
  }
}

function readStoredTradeOptions() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(TRADE_OPTIONS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as string[];
    if (!Array.isArray(parsed) || !parsed.length) return null;
    return Array.from(new Set(parsed.map((item) => item.trim()).filter(Boolean)));
  } catch {
    return null;
  }
}

function persistVendors(vendors: VendorBasicProfile[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(vendors));
}

function persistTradeOptions(tradeOptions: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TRADE_OPTIONS_STORAGE_KEY, JSON.stringify(tradeOptions));
}

export function VendorStoreProvider({ children }: { children: React.ReactNode }) {
  const [vendors, setVendors] = useState<VendorBasicProfile[]>(getDefaultVendors);
  const [tradeOptions, setTradeOptions] = useState<string[]>(() => readStoredTradeOptions() ?? DEFAULT_TRADE_OPTIONS);
  const [isReady, setIsReady] = useState(false);
  const hasLocalChangesRef = useRef(false);

  useEffect(() => {
    const storedVendors = readStoredVendors();

    setVendors((current) => {
      if (hasLocalChangesRef.current || !storedVendors) {
        return current;
      }
      return storedVendors;
    });
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;
    persistVendors(vendors);
  }, [isReady, vendors]);

  useEffect(() => {
    if (!isReady) return;
    persistTradeOptions(tradeOptions);
  }, [isReady, tradeOptions]);

  const value = useMemo<VendorStoreContextValue>(() => ({
    vendors,
    tradeOptions,
    isReady,
    createVendor(input) {
      const name = input.name.trim();
      const tradeLabel = input.tradeLabel?.trim() || "待補充";
      const existed = vendors.find((vendor) => vendor.name === name);
      if (!name) {
        return existed
          ? { ok: false as const, reason: "duplicate" as const, vendor: existed }
          : {
              ok: true as const,
              vendor: vendors[0] ?? withDefaultTrade(vendorProfiles[0]),
            };
      }
      if (existed) {
        return { ok: false as const, reason: "duplicate" as const, vendor: existed };
      }

      const baseId = `vendor-${slugifyVendorName(name)}`;
      const uniqueId = vendors.some((vendor) => vendor.id === baseId) ? `${baseId}-${Date.now()}` : baseId;

      const nextVendor: VendorBasicProfile = {
        id: uniqueId,
        name,
        category: tradeLabel,
        tradeLabel,
        contactName: "",
        phone: "",
        email: "",
        lineId: "",
        address: "",
        note: "Quick create 建立，聯絡資訊待補。",
        bankName: "",
        bankCode: "",
        accountName: "",
        accountNumber: "",
      };
      hasLocalChangesRef.current = true;
      setVendors((current) => {
        const nextVendors = [...current, nextVendor];
        persistVendors(nextVendors);
        return nextVendors;
      });
      return { ok: true as const, vendor: nextVendor };
    },
    updateVendor(id, patch) {
      hasLocalChangesRef.current = true;
      setVendors((current) => {
        const nextVendors = current.map((vendor) => {
          if (vendor.id !== id) return vendor;
          const tradeLabel = patch.tradeLabel?.trim() || patch.category?.trim() || vendor.tradeLabel || vendor.category || "待補充";
          return {
            ...vendor,
            ...patch,
            tradeLabel,
            category: tradeLabel,
          };
        });
        persistVendors(nextVendors);
        return nextVendors;
      });
    },
    deleteVendor(id) {
      hasLocalChangesRef.current = true;
      setVendors((current) => {
        const nextVendors = current.filter((vendor) => vendor.id !== id);
        persistVendors(nextVendors);
        return nextVendors;
      });
    },
    addTradeOption(trade) {
      const nextTrade = trade.trim();
      if (!nextTrade) return;
      setTradeOptions((current) => {
        if (current.includes(nextTrade)) return current;
        const next = [...current, nextTrade];
        persistTradeOptions(next);
        return next;
      });
    },
    removeTradeOption(trade) {
      setTradeOptions((current) => {
        const next = current.filter((item) => item !== trade);
        persistTradeOptions(next);
        return next;
      });
      setVendors((current) => {
        const nextVendors = current.map((vendor) => {
          if ((vendor.tradeLabel || vendor.category) !== trade) return vendor;
          return {
            ...vendor,
            tradeLabel: "待補充",
            category: "待補充",
          };
        });
        persistVendors(nextVendors);
        return nextVendors;
      });
    },
    getVendorById(id) {
      return vendors.find((vendor) => vendor.id === id);
    },
    getVendorByName(name) {
      return vendors.find((vendor) => vendor.name === name);
    },
  }), [isReady, tradeOptions, vendors]);

  return <VendorStoreContext.Provider value={value}>{children}</VendorStoreContext.Provider>;
}

export function useVendorStore() {
  const context = useContext(VendorStoreContext);
  if (!context) {
    throw new Error("useVendorStore must be used within VendorStoreProvider");
  }
  return context;
}
