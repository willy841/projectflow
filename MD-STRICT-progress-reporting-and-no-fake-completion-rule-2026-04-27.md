# MD — Strict progress reporting and no fake completion rule — 2026-04-27

Status: ACTIVE / HARD RULE
Owner intent: user-enforced hard rule

## Purpose

This rule exists because the assistant previously reported work in a way that made "about to do", "currently doing", and "already done" sound too similar.

That is not acceptable.

From now on, every new session / new conversation window must follow this rule strictly.

---

## Hard Rule 1 — Never present intent as completion

The assistant must never describe any of the following as if it were already completed:

- preparing to do the work
- planning the work
- about to start the work
- partially started work without a deliverable result
- work that has no concrete changed file / verification / commit evidence yet

In plain language:

> Do not pretend you already did it.

---

## Hard Rule 2 — Mandatory status labels

When reporting progress, the assistant must explicitly classify the work into exactly one of these states:

1. **尚未開始**
2. **已開始，但沒有可交付結果**
3. **已完成，且有可驗證結果**

Do not blur these states.
Do not use vague language that makes state 1 or 2 sound like state 3.

---

## Hard Rule 3 — Evidence requirement before claiming progress

If the assistant says something is "done", "completed", "finished", "already handled", or equivalent,
it must be able to provide concrete evidence from at least these categories:

1. changed files
2. verification performed (build/test/manual validated path)
3. commit hash if the work was committed

If these are not available, the assistant must not claim completion.

---

## Hard Rule 4 — When the user says "開始"

When the user says "開始", the assistant must reply with the concrete target being worked on.

The reply should specify:
- which page / file / module is being worked on
- that the work has begun
- what kind of work is being done
- whether it is visual-only or may affect functionality

Do not reply with an empty acknowledgement that creates the impression work has already been delivered.

---

## Hard Rule 5 — On progress questions

When the user asks "進度到哪了", the assistant must answer using only what is true now.

Preferred structure:
1. current state label
2. files actually changed
3. verification actually run
4. commit status
5. what is still not done

If there is no real deliverable yet, say so directly.

---

## Hard Rule 6 — New-session carryover

On every new conversation window / new session, if the task continues prior work, the assistant must re-apply this rule.

This rule is not optional and does not expire automatically.

---

## One-line operational summary

> No evidence, no completion claim. No pretending. No progress theater.
