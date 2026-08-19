# Poke-Deck

> A production-ready full-stack web application designed for interactive digital card collecting and deck management, handling complex game logic across 3,000+ card assets.

**🔗 Live Demo:** [poke-deck](https://poke-deck-xi.vercel.app/)

---

## ⚡ Cool Features & Engineering Highlights

* **3D Interactive Experience & Animations:** Unique, custom-built UI featuring immersive 3D card interactions, fluid animations, and micro-interactions that elevate the user experience.
* **3,000+ Dynamic Objects:** Fast client-side searching, sorting, and type-based filtering without performance lag or UI freezing.
* **Complex Deck Building Logic:** Real-time state synchronization that tracks deck constraints, card limits, and energy/type distribution.
* **Multi-Layer Automated Testing:** Comprehensive test coverage — unit tests for edge-case helper logic, integration tests for key hooks, and E2E Playwright flows ensuring smooth user journeys.
* **Strict Type Safety:** Fully typed end-to-end stack with TypeScript, Prisma models, and strict API response schemas.

---

## 🎯 About The Project

**Poke-Deck** was built for dynamic card game enthusiasts and collectors who need a fast, responsive, and intuitive interface to explore, filter, build, and test custom card decks. 

Dealing with thousands of card items and intricate game rules requires heavy data management and near-instant UI updates. Poke-Deck addresses this by combining a robust database layer with highly optimized client-side state handling.

---

## 🛠 Tech Stack & Architecture

* **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS
* **Backend & Database:** Node.js, PostgreSQL, Prisma ORM
* **State Management & Data:** Custom React hooks, optimized context layer for fast client-side sorting/filtering
* **Testing Suite:** Vitest, React Testing Library (Unit/Integration), Playwright (E2E)
* **DevOps & Infrastructure:** Docker, CI/CD automated GitHub workflows, Vercel deployment
