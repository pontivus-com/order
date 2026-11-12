# Order

**Governed software delivery for coding agents.**

**Give agents the work. Keep authority over what counts as done.**

Order turns engineering intent into explicitly approved work, runs coding agents within that authority, and independently verifies the resulting change.

Order is a Pontivus-native engineering tool. It is designed to govern how software work progresses from intent through explicit execution authority to independently verified completion.

## Pontivus tooling family

**Span keeps engineering understanding current. Order keeps engineering work under authority.**

- **Span** preserves supported codebase understanding across coding sessions and identifies when that understanding needs reassessment.
- **Order** governs whether proposed software work may progress into execution, constrains coding-agent implementation to explicitly authorized work, and independently determines whether the resulting change has satisfied its completion requirements.

## Product boundary

Order is a local workbench and execution control plane for governed coding-agent work.

The intended lifecycle separates investigation, requirements, design, planning, readiness, explicit sign-off, bounded implementation, deterministic verification, and independent review.

A successful run ends at a **verified candidate**. Order does not make commit, push, merge, deployment, or production-mutation authority part of the product boundary.

## Repository status

This repository currently establishes the **Order product identity and migration boundary**.

The existing implementation will be migrated from its earlier Gateweft codebase in a later governed repository transition. Until that migration lands, this repository does not contain the productive Order runtime and provides no installation instructions.

See:

- [Product identity](docs/product-identity.md)
- [Implementation migration boundary](docs/implementation-migration-boundary.md)
