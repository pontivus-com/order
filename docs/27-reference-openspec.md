# 27 — OpenSpec reference facts for agentic software-work artifacts

**Status:** Binding factual reference  
**Canonical concern ID:** `GW-DOC-REF-OPENSPEC`  
**Versioned concern ID:** `GW-DOC-REF-OPENSPEC-V1-2026-11-12`  
**Verified:** 2026-11-12  
**Observed upstream source:** `Fission-AI/OpenSpec@d12c2817776779e06891d68230773b3bb673b106`

## 1. Purpose

This document owns only the external OpenSpec facts that Order is allowed to rely on as prior-art evidence for structured agentic software-work artifacts.

It does not own Order product behavior, lifecycle semantics, templates, persistence, configuration, or contracts. Any Order requirement that uses these facts is owned by its own canonical Order document and cites `GW-DOC-REF-OPENSPEC-V1-2026-11-12`.

## 2. Verified official sources

Primary official documentation:

- https://openspec.dev/docs/configuration/change-metadata
- https://openspec.dev/docs/customize-schemas
- https://openspec.dev/docs/reference/schemas/schema-yaml

Pinned official repository sources at the observed upstream commit:

- https://github.com/Fission-AI/OpenSpec/blob/d12c2817776779e06891d68230773b3bb673b106/docs-lab/reference/configuration/change-metadata.md
- https://github.com/Fission-AI/OpenSpec/blob/d12c2817776779e06891d68230773b3bb673b106/docs-lab/reference/schemas/schema-yaml.md
- https://github.com/Fission-AI/OpenSpec/blob/d12c2817776779e06891d68230773b3bb673b106/schemas/spec-driven/schema.yaml

## 3. Relied-upon facts

### 3.1 Change-local metadata is distinct from planning artifacts

OpenSpec keeps per-change metadata in `.openspec.yaml` beside the change artifacts. Its documented metadata includes a required workflow `schema` plus optional creation date, goal, affected areas, initiative linkage and explicit behavior flags.

The selected schema is written with the change and remains that change's schema even if project configuration later changes. Metadata is validated when read or written, and invalid metadata stops the operation instead of being silently discarded.

### 3.2 A schema defines an artifact graph

OpenSpec schema definitions declare the planning artifacts a workflow produces. An artifact definition has an identifier, output path or glob, description, template, optional agent instruction and dependencies through `requires`.

Dependency references must resolve inside the same schema; missing identifiers, duplicate identifiers and dependency cycles fail schema validation.

The schema also defines when implementation/apply becomes available through `apply.requires`, and may identify Markdown task files to track through `apply.tracks`.

### 3.3 Templates and workflow structure are resolved from a catalog hierarchy

OpenSpec resolves schemas from project, then user, then package locations. A project-local schema can therefore replace the lower-priority copy with the same lookup name, while a package can provide built-in defaults.

Templates are separate schema resources. The schema identifies which template supplies the format for each artifact rather than embedding the document body into the change metadata.

### 3.4 The bundled spec-driven schema separates why, what, how and implementation tasks

The observed default `spec-driven` schema defines `proposal`, `specs`, `design` and `tasks` artifacts. The proposal precedes the others; specs and design depend on the proposal; tasks depend on both specs and design.

The official instructions distinguish behavior specifications from implementation detail and direct implementation tasks to a dedicated task artifact.

## 4. Explicit limits

These facts establish prior art only.

Order does not inherit OpenSpec's artifact names, lifecycle, change metadata grammar, spec-delta format, apply semantics, archive semantics, path layout or extension mechanism merely because OpenSpec provides them. Any adopted Order behavior requires its own P2-P6 authority.
