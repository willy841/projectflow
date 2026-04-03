"use client";

import { useEffect, useState } from "react";
import { vendorPackages, type VendorPackage } from "@/components/vendor-data";

const STORAGE_KEY = "projectflow-vendor-packages";

function getDefaultPackages() {
  return vendorPackages;
}

function readStoredPackages(): VendorPackage[] {
  if (typeof window === "undefined") return getDefaultPackages();

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return getDefaultPackages();

  try {
    const parsed = JSON.parse(raw) as VendorPackage[];
    if (!Array.isArray(parsed)) return getDefaultPackages();

    const merged = new Map<string, VendorPackage>();
    getDefaultPackages().forEach((pkg) => merged.set(pkg.id, pkg));
    parsed.forEach((pkg) => merged.set(pkg.id, pkg));
    return Array.from(merged.values());
  } catch {
    return getDefaultPackages();
  }
}

function persistPackages(packages: VendorPackage[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(packages));
}

export function getStoredVendorPackageById(id: string) {
  return readStoredPackages().find((pkg) => pkg.id === id);
}

export function getStoredVendorPackages() {
  return readStoredPackages();
}

export function getStoredPackagesByProjectId(projectId: string) {
  return readStoredPackages().filter((pkg) => pkg.projectId === projectId);
}

export function upsertStoredVendorPackage(nextPackage: VendorPackage) {
  const current = readStoredPackages();
  const existed = current.some((pkg) => pkg.id === nextPackage.id);
  const next = existed
    ? current.map((pkg) => (pkg.id === nextPackage.id ? nextPackage : pkg))
    : [...current, nextPackage];
  persistPackages(next);
  return next;
}

export function useStoredVendorPackages(projectId: string) {
  const [packages, setPackages] = useState<VendorPackage[]>(() => getStoredPackagesByProjectId(projectId));

  useEffect(() => {
    setPackages(getStoredPackagesByProjectId(projectId));
  }, [projectId]);

  function syncPackages(nextPackages: VendorPackage[]) {
    const current = readStoredPackages();
    const otherProjects = current.filter((pkg) => pkg.projectId !== projectId);
    const nextAll = [...otherProjects, ...nextPackages];
    persistPackages(nextAll);
    setPackages(nextPackages);
  }

  return { packages, syncPackages };
}
