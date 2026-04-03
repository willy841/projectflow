"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { vendorProfiles, type VendorBasicProfile } from "@/components/vendor-data";

const VENDORS_STORAGE_KEY = "projectflow-vendors";
const TRADES_STORAGE_KEY = "projectflow-vendor-trades";

const DEFAULT_TRADE_OPTIONS = ["輸出", "木作", "施工", "平面輸出", "大圖輸出", "活動佈置", "燈光", "音響", "視覺製作", "道具", "金工", "壓克力", "招牌"];

export type QuickCreateVendorInput = {
  name: string;
  tradeLabels: string[];
};

type CreateVendorResult =
  | { ok: true; vendor: VendorBasicProfile }
  | { ok: false; reason: "duplicate"; vendor: VendorBasicProfile };

type CreateTradeResult =
  | { ok: true; trade: string }
  | { ok: false; reason: "empty" | "duplicate"; trade?: string };

type DeleteTradeResult =
  | { ok: true }
  | { ok: false; reason: "in-use"; vendorNames: string[] };

type VendorStoreContextValue = {
  vendors: VendorBasicProfile[];
  trades: string[];
  isReady: boolean;
  createVendor: (input: QuickCreateVendorInput) => CreateVendorResult;
  updateVendor: (id: string, patch: Partial<VendorBasicProfile>) => void;
  deleteVendor: (id: string) => void;
  createTrade: (name: string) => CreateTradeResult;
  deleteTrade: (name: string) => DeleteTradeResult;
  getVendorById: (id: string) => VendorBasicProfile | undefined;
  getVendorByName: (name: string) => VendorBasicProfile | undefined;
};

const VendorStoreContext = createContext<VendorStoreContextValue | null>(null);

function slugifyVendorName(name: string) {
  return (
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
      .replace(/^-+|-+$/g, "") || `vendor-${Date.now()}`
  );
}

function normalizeTradeName(name: string) {
  return name.trim();
}

function dedupeTrades(trades: string[]) {
  return Array.from(new Set(trades.map(normalizeTradeName).filter(Boolean)));
}

function withDefaultTrades(vendor: VendorBasicProfile): VendorBasicProfile {
  const tradeLabels = dedupeTrades(vendor.tradeLabels ?? (vendor.category ? [vendor.category] : []));
  return {
    ...vendor,
    category: tradeLabels[0] ?? vendor.category ?? "待補充",
    tradeLabels,
  };
}

function getDefaultVendors() {
  return vendorProfiles.map(withDefaultTrades);
}

function buildTradeCatalog(vendors: VendorBasicProfile[]) {
  return dedupeTrades([
    ...DEFAULT_TRADE_OPTIONS,
    ...vendors.flatMap((vendor) => vendor.tradeLabels ?? []),
    ...vendors.map((vendor) => vendor.category),
  ]);
}

function readStoredVendors() {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(VENDORS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as VendorBasicProfile[];
    if (!Array.isArray(parsed) || !parsed.length) return null;
    return parsed.map(withDefaultTrades);
  } catch {
    return null;
  }
}

function readStoredTrades() {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(TRADES_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as string[];
    if (!Array.isArray(parsed)) return null;
    return dedupeTrades(parsed);
  } catch {
    return null;
  }
}

function persistVendors(vendors: VendorBasicProfile[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(VENDORS_STORAGE_KEY, JSON.stringify(vendors));
}

function persistTrades(trades: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TRADES_STORAGE_KEY, JSON.stringify(trades));
}

export function VendorStoreProvider({ children }: { children: React.ReactNode }) {
  const [vendors, setVendors] = useState<VendorBasicProfile[]>(getDefaultVendors);
  const [trades, setTrades] = useState<string[]>(() => buildTradeCatalog(getDefaultVendors()));
  const [isReady, setIsReady] = useState(false);
  const hasLocalChangesRef = useRef(false);

  useEffect(() => {
    const storedVendors = readStoredVendors();
    const nextVendors = storedVendors ?? getDefaultVendors();
    const storedTrades = readStoredTrades();
    const nextTrades = dedupeTrades([...(storedTrades ?? []), ...buildTradeCatalog(nextVendors)]);

    setVendors((current) => {
      if (hasLocalChangesRef.current) {
        return current;
      }
      return nextVendors;
    });
    setTrades(nextTrades);
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;
    persistVendors(vendors);
  }, [isReady, vendors]);

  useEffect(() => {
    if (!isReady) return;
    persistTrades(trades);
  }, [isReady, trades]);

  const value = useMemo<VendorStoreContextValue>(
    () => ({
      vendors,
      trades,
      isReady,
      createVendor(input) {
        const name = input.name.trim();
        const tradeLabels = dedupeTrades(input.tradeLabels);
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
        if (tradeLabels.length) {
          setTrades((current) => {
            const nextTrades = dedupeTrades([...current, ...tradeLabels]);
            persistTrades(nextTrades);
            return nextTrades;
          });
        }
        return { ok: true as const, vendor: nextVendor };
      },
      updateVendor(id, patch) {
        hasLocalChangesRef.current = true;
        setVendors((current) => {
          const nextVendors = current.map((vendor) => {
            if (vendor.id !== id) return vendor;
            const tradeLabels = patch.tradeLabels ? dedupeTrades(patch.tradeLabels) : vendor.tradeLabels ?? [];
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
        if (patch.tradeLabels?.length) {
          setTrades((current) => {
            const nextTrades = dedupeTrades([...current, ...patch.tradeLabels!]);
            persistTrades(nextTrades);
            return nextTrades;
          });
        }
      },
      deleteVendor(id) {
        hasLocalChangesRef.current = true;
        setVendors((current) => {
          const nextVendors = current.filter((vendor) => vendor.id !== id);
          persistVendors(nextVendors);
          return nextVendors;
        });
      },
      createTrade(name) {
        const nextTrade = normalizeTradeName(name);
        if (!nextTrade) {
          return { ok: false as const, reason: "empty" as const };
        }
        const existed = trades.find((trade) => trade === nextTrade);
        if (existed) {
          return { ok: false as const, reason: "duplicate" as const, trade: existed };
        }

        setTrades((current) => {
          const nextTrades = [...current, nextTrade];
          persistTrades(nextTrades);
          return nextTrades;
        });
        return { ok: true as const, trade: nextTrade };
      },
      deleteTrade(name) {
        const vendorNames = vendors
          .filter((vendor) => (vendor.tradeLabels ?? []).includes(name))
          .map((vendor) => vendor.name);

        if (vendorNames.length) {
          return { ok: false as const, reason: "in-use" as const, vendorNames };
        }

        setTrades((current) => {
          const nextTrades = current.filter((trade) => trade !== name);
          persistTrades(nextTrades);
          return nextTrades;
        });
        return { ok: true as const };
      },
      getVendorById(id) {
        return vendors.find((vendor) => vendor.id === id);
      },
      getVendorByName(name) {
        return vendors.find((vendor) => vendor.name === name);
      },
    }),
    [isReady, trades, vendors],
  );

  return <VendorStoreContext.Provider value={value}>{children}</VendorStoreContext.Provider>;
}

export function useVendorStore() {
  const context = useContext(VendorStoreContext);
  if (!context) {
    throw new Error("useVendorStore must be used within VendorStoreProvider");
  }
  return context;
}
