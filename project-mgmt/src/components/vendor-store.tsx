"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { vendorProfiles, type VendorBasicProfile } from "@/components/vendor-data";

const STORAGE_KEY = "projectflow-vendors";

export const TRADE_OPTIONS = ["輸出", "木作", "施工", "平面輸出", "大圖輸出", "活動佈置", "燈光", "音響", "視覺製作", "道具", "金工", "壓克力", "招牌"];

export type QuickCreateVendorInput = {
  name: string;
  tradeLabels: string[];
};

type VendorStoreContextValue = {
  vendors: VendorBasicProfile[];
  isReady: boolean;
  createVendor: (input: QuickCreateVendorInput) => { ok: true; vendor: VendorBasicProfile } | { ok: false; reason: "duplicate"; vendor: VendorBasicProfile };
  updateVendor: (id: string, patch: Partial<VendorBasicProfile>) => void;
  getVendorById: (id: string) => VendorBasicProfile | undefined;
  getVendorByName: (name: string) => VendorBasicProfile | undefined;
};

const VendorStoreContext = createContext<VendorStoreContextValue | null>(null);

function slugifyVendorName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "") || `vendor-${Date.now()}`;
}

function withDefaultTrades(vendor: VendorBasicProfile): VendorBasicProfile {
  return {
    ...vendor,
    tradeLabels: vendor.tradeLabels ?? (vendor.category ? [vendor.category] : []),
  };
}

function getDefaultVendors() {
  return vendorProfiles.map(withDefaultTrades);
}

function readStoredVendors() {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as VendorBasicProfile[];
    if (!Array.isArray(parsed) || !parsed.length) return null;
    return parsed.map(withDefaultTrades);
  } catch {
    return null;
  }
}

function persistVendors(vendors: VendorBasicProfile[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(vendors));
}

export function VendorStoreProvider({ children }: { children: React.ReactNode }) {
  const [vendors, setVendors] = useState<VendorBasicProfile[]>(getDefaultVendors);
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

  const value = useMemo<VendorStoreContextValue>(() => ({
    vendors,
    isReady,
    createVendor(input) {
      const name = input.name.trim();
      const tradeLabels = Array.from(new Set(input.tradeLabels.map((item) => item.trim()).filter(Boolean)));
      const existed = vendors.find((vendor) => vendor.name === name);
      if (!name) {
        return existed
          ? { ok: false as const, reason: "duplicate" as const, vendor: existed }
          : {
              ok: true as const,
              vendor: vendors[0] ?? withDefaultTrades(vendorProfiles[0]),
            };
      }
      if (existed) {
        return { ok: false as const, reason: "duplicate" as const, vendor: existed };
      }

      const nextVendor: VendorBasicProfile = {
        id: `vendor-${slugifyVendorName(name)}`,
        name,
        category: tradeLabels[0] || "待補充",
        tradeLabels,
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
          const tradeLabels = patch.tradeLabels
            ? Array.from(new Set(patch.tradeLabels.map((item) => item.trim()).filter(Boolean)))
            : vendor.tradeLabels ?? [];
          return {
            ...vendor,
            ...patch,
            category: patch.category ?? tradeLabels[0] ?? vendor.category,
            tradeLabels,
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
  }), [isReady, vendors]);

  return <VendorStoreContext.Provider value={value}>{children}</VendorStoreContext.Provider>;
}

export function useVendorStore() {
  const context = useContext(VendorStoreContext);
  if (!context) {
    throw new Error("useVendorStore must be used within VendorStoreProvider");
  }
  return context;
}
