# Projectflow financial reopen retention rules — 2026-04-26

Status: active

## Purpose

This document formalizes the approved reopen retention semantics for the financial lifecycle, with explicit scope over:

- retained closeout snapshots
- project collections
- vendor payment records
- active/live financial truth restoration

It exists to remove ambiguity around what reopen changes versus what reopen must preserve.

## Official rules

### 1. Reopen is a status switch, not a financial purge

When a project is reopened:

- project status returns to active / live mode
- reopen does **not** mean rollback of financial history
- reopen does **not** mean wiping collection/payment/snapshot records

In other words:

> reopen restores active workflow mode, but it does not erase previously written financial facts.

### 2. Reopen does not delete retained closeout snapshots

Approved rule:

- retained closeout snapshot rows in `financial_closeout_snapshots` remain preserved after reopen
- reopen only changes which truth source active views read
- reopen does not purge retained closeout history

### 3. Reopen does not delete project collections

Approved rule:

- collection records remain intact after reopen
- reopening a project does not reset receivable/collected history
- subsequent closeout eligibility must continue reading the already-written collection truth

### 4. Reopen does not delete vendor payment records

Approved rule:

- vendor payment records remain intact after reopen
- reopening a project does not erase paid-history facts
- if payment reversal is needed, it must happen via explicit payment deletion/reversal semantics, not as a side-effect of reopen

### 5. Reopen restores active/live truth for active workflows

After reopen:

- active quote-cost / financial / manual-cost / reconciliation flows return to live truth
- closed-state retained readback remains preserved as historical retained truth
- if a later second closeout happens, it overwrites the single retained snapshot using the then-current active truth

## Implementation expectation

At minimum, reopen behavior must continue to satisfy these invariants:

1. retained snapshot is preserved
2. project collections are preserved
3. vendor payment records are preserved
4. active views return to live truth
5. second closeout reuses existing live financial facts rather than silently resetting them
