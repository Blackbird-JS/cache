# Blackbird Cache Engine Roadmap

This document outlines the active development trajectory, upcoming features, and architectural optimizations planned for `@blackbirdjs/cache`.

---

## Phase 1: Robustness & Data Control (Near Term)

Core extensions designed to increase developer utility, global state management, and schema boundaries.

- [ ] **Global Database Utilities (`cache.clear()`)**
  - Implement a native atomic clearing engine to flush specific object stores safely (critical for handling user logout scenarios).
- [ ] **Storage Metadata Inspection (`.keys()` / `.size()`)**
  - Add accessor methods utilizing `store.getAllKeys()` to let developers query active cache manifests without loading heavy binary or string payloads into memory.
- [ ] **Multi-Tenant Namespacing (`prefix`)**
  - Introduce an optional initialization configuration option (e.g., `prefix: 'v1_'`) to isolate keys and prevent data collisions inside overlapping micro-frontend application architectures.

---

## Phase 2: High-Performance Optimizations (Mid Term)

Advanced asynchronous scheduling and resource management strategies to maximize hardware data-transfer limits.

- [ ] **Atomic Multi-Key Batching (`setMany()` / `getMany()`)**
  - Group bulk collection mutations inside *one single transaction block* to eliminate transaction queue scheduling overhead and unlock up to 10x faster execution velocities.
- [ ] **LRU Eviction (Least Recently Used Algorithm)**
  - Build an automated storage monitor that watches browser quotas and gracefully evicts the oldest, least-accessed assets when local storage reaches a specific density threshold.
- [ ] **Hybrid L1 Memory Pre-Cache (`Map()`)**
  - Inject an inside-RAM JavaScript `Map()` cache layer directly in front of the database. Read operations evaluate the map first for microsecond retrieval speeds, while background tasks handle disk persistence asynchronously to survive page reloads.

---

## Contributing

If you are interested in accelerating any of these architectural features, please open an issue to claim the task or submit a pull request directly to the development branch!
