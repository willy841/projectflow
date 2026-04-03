"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { vendorProfiles, type VendorBasicProfile } from "@/components/vendor-data";

const STORAGE_KEY = "projectflow-vendors";

export const TRADE_OPTIONS = ["輸出", "木作", "施工", "平面輸出", "大圖輸出", "活動佈置", "燈光", "音響", "視覺製作", "道具", "金工", "壓克力", "招牌"];

export type QuickCreateVendorInput = {
  name: string;
  tradeLabels: string[];
};

type VendorStoreContextValue = {
  vendors: VendorBasicProfile[];
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

export function VendorStoreProvider({ children }: { children: React.ReactNode }) {
  const [vendors, setVendors] = useState<VendorBasicProfile[]>(() => vendorProfiles.map(withDefaultTrades));

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as VendorBasicProfile[];
      if (!Array.isArray(parsed) || !parsed.length) return;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVendors(parsed.map(withDefaultTrades));
    } catch {
      // ignore malformed storage in MVP
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(vendors));
  }, [vendors]);

  const value = useMemo<VendorStoreContextValue>(() => ({
    vendors,
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
      setVendors((current) => [...current, nextVendor]);
      return { ok: true as const, vendor: nextVendor };
    },
    updateVendor(id, patch) {
      setVendors((current) =>
        current.map((vendor) => {
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
        }),
      );
    },
    getVendorById(id) {
      return vendors.find((vendor) => vendor.id === id);
    },
    getVendorByName(name) {
      return vendors.find((vendor) => vendor.name === name);
    },
  }), [vendors]);

  return <VendorStoreContext.Provider value={value}>{children}</VendorStoreContext.Provider>;
}

export function useVendorStore() {
  const context = useContext(VendorStoreContext);
  if (!context) {
    throw new Error("useVendorStore must be used within VendorStoreProvider");
  }
  return context;
}
