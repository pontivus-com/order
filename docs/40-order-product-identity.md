# 40 — Order product identity

**Status:** Canonical product identity and positioning baseline for this repository.  
**Canonical concern ID:** `GW-DOC-PRODUCT-IDENTITY`  
**Versioned concern ID:** `GW-DOC-PRODUCT-IDENTITY-V1`  
**Pyramid layer:** P2 user/product intent  
**Scope:** Naming, descriptors, value proposition, brand message hierarchy, family relationship, and approved product-language hierarchy.  
**Non-scope:** Runtime architecture, lifecycle contracts, persistence, transport, execution semantics, or implementation planning.

## 1. Canonical identity

| Surface | Canonical wording |
|---|---|
| Product name | **Order** |
| Endorsed/full name | **Pontivus Order** |
| Category descriptor | **Open-source software factory for coding agents.** |
| Primary proposition | **Ideas in. Results out.** |
| Supporting line | **From idea to verified result.** |
| One-line description | **Order turns ideas for software work into verified results by carrying them through definition, implementation, testing, review, bounded remediation, and independent verification.** |
| Short description | **An open-source software factory that carries software work from idea to verified result.** |
| Technical description | **A local workbench and execution control plane that turns governed software work into verified candidates.** |
| Terminal product outcome | **Verified candidate** |
| Family relationship | **Span preserves engineering understanding. Order carries engineering work through to verified results.** |

## 2. Product job

Order turns software-work ideas into verified results.

A user starts with something that needs to happen: a feature, defect, change, investigation, audit, documentation update, infrastructure change, UI change, or other repository-governed work.

Order owns the production process required to carry that work forward:

1. establish what is actually true;
2. define the required outcome;
3. resolve the solution and implementation plan;
4. independently assess readiness;
5. require explicit sign-off before productive implementation;
6. execute the authorized work;
7. run prescribed deterministic verification;
8. run independent semantic review;
9. perform bounded remediation where the failure is legitimately repairable;
10. re-verify and produce the terminal result.

Some work correctly terminates without implementation. Investigations, audits, disproven ideas, duplicate work, and already-satisfied work do not manufacture code merely because they entered the system.

The user manages **what work should happen**. Order manages **how that work is carried through**.

## 3. User-level value

The primary user value is not governance for its own sake.

Order is intended to let an engineer or team define the work that matters and avoid manually operating every agent invocation, verification step, retry, and review cycle required to turn that work into a reliable outcome.

The product therefore presents one centralized work surface over:

- work that still needs definition;
- work awaiting a human decision or sign-off;
- work executing;
- work blocked or failed;
- work under verification or review;
- work undergoing bounded remediation;
- work that has reached a verified terminal result.

The desired abstraction is:

```text
idea / requested change
        |
        v
      Order
 software-work factory
        |
        v
 verified result
```

Coding agents operate inside the factory. They are execution components, not the product identity.

## 4. Differentiation

Order does not primarily compete on making a coding agent more autonomous.

Its distinguishing operating model is that the software work itself has a durable lifecycle and an explicit authority boundary.

An implementation agent does not get to:

- silently turn ambiguity into new requirements;
- broaden its own authorized scope;
- manufacture additional execution tasks;
- treat an adjacent discovery as permission to implement unrelated work;
- redefine the acceptance criteria to fit its implementation;
- certify its own work as complete.

Order carries the approved work through execution and checks the resulting change against the work that was actually authorized.

This prevents the common failure mode where the implementation may be technically plausible while the job itself has drifted.

## 5. Product-language hierarchy

Use this hierarchy consistently.

### Primary headline

> **Ideas in. Results out.**

This is the primary brand proposition.

### Supporting line

> **From idea to verified result.**

This explains what the primary proposition means.

### Category

> **Open-source software factory for coding agents.**

Use this when the reader needs to understand what kind of product Order is.

### Short description

> Order is an open-source software factory that carries software work from idea to verified result.

### Standard description

> Order turns ideas for software work into verified results by carrying them through definition, implementation, testing, review, bounded remediation, and independent verification.

### Expanded description

> Start with a feature, bug, change, audit, investigation, documentation task, infrastructure change, or other piece of repository-governed work. Order works out what needs to happen, makes the work implementation-ready, requires explicit sign-off before productive execution, runs coding agents against the authorized work, tests and reviews the result, performs bounded remediation where appropriate, and produces a verified candidate.

### Technical description

> Order is a local workbench and execution control plane that durably owns software-work state, authorized execution, verification evidence, independent review, bounded remediation, and terminal result classification.

The technical description is explanatory architecture language. It is not the primary product message.

## 6. Supporting messages

These messages explain why the factory can produce a reliable result.

### Define the work before building it

Order separates current-state research, requirements, design, planning, and readiness from implementation.

Implementation should not be the stage where material product or architecture decisions are invented.

### Keep the work from drifting

The implementation agent receives exact authorized work with explicit scope, exclusions, acceptance criteria, dependencies, and verification requirements.

The agent does the work. It does not redefine the work.

### Do not let the builder certify itself

A successful implementation claim from the builder is not completion evidence.

Candidate completion requires prescribed deterministic verification and independent semantic review.

### Correct what can be corrected

Where validation identifies a legitimately repairable implementation defect, Order may run bounded remediation and re-verification.

Where the problem is upstream in requirements, design, authority, or readiness, the work returns to the correct owning stage rather than being patched blindly.

### Allow no-code results

Doing nothing is a valid result when the requested work is disproven, duplicate, already satisfied, informational only, or otherwise does not justify implementation.

## 7. Claim boundaries

The following are supported product facts:

- Order carries software work through a durable governed lifecycle;
- productive implementation requires explicit sign-off;
- implementation agents cannot broaden their own authorized execution tasks;
- required deterministic verification is external to the implementation agent;
- independent semantic review is required for candidate completion;
- bounded remediation exists where permitted by validation policy;
- investigations and audits may terminate without implementation;
- Order terminates at a verified candidate;
- Order does not commit, push, merge, deploy, or mutate production as part of v1.

Do not present the following as measured facts without external evidence:

- reduced engineering time;
- reduced supervision time;
- fewer defects;
- higher developer productivity;
- faster delivery;
- larger tasks delegated per engineer;
- lower review cost;
- improved code quality;
- increased trust in coding agents.

These may be tested as adoption-benefit hypotheses but are not yet quantified product claims.

## 8. Visual identity

The canonical visual metaphor is **aperture / focus**.

An idea begins unresolved. Order brings the work into focus, carries it through the software factory, and produces a verified result.

The aperture is a metaphor. Order is not a camera product and the mark must not become a literal camera illustration.

Canonical assets are owned under `assets/`.

Primary visual rules:

- simple geometric aperture symbol;
- strong performance in monochrome;
- deep navy / Order blue palette;
- no checkmark embedded in the mark;
- no workflow nodes;
- no shield;
- no literal factory;
- no robot or AI sparkle;
- no arrow as the primary symbol;
- no literal camera body or lens detail.

The primary README lockup uses:

> **Ideas in. Results out.**  
> **From idea to verified result.**

## 9. Family relationship with Span

Span and Order are complementary Pontivus-native engineering tools.

**Span** preserves supported engineering understanding and whether that understanding remains current.

**Order** carries engineering work from idea through the production process to a verified result.

A concise family statement is:

> **Span preserves engineering understanding. Order carries engineering work through to verified results.**

The products may integrate, but neither becomes a semantic subsystem of the other merely because they belong to the same family.

## 10. Positioning boundaries

Do not position Order primarily as:

- an AI governance platform;
- a generic workflow engine;
- a ticketing or Kanban product;
- an autonomous product manager;
- a general multi-agent framework;
- an IDE;
- a coding agent itself;
- a CI/CD replacement;
- a deployment or merge authority;
- a generic task orchestrator.

Those descriptions either expose an internal mechanism or materially understate the product.

The product-level abstraction is the **software factory**: software work enters as an idea or requested change and is carried through the necessary definition, execution, validation, and remediation to a verified terminal result.

## 11. Naming usage

Use **Order** in the product itself and ordinary product prose.

Use **Pontivus Order** when the endorsed/full identity is useful, including:

- first mention on a Pontivus family page;
- external catalog or directory entries;
- formal metadata where product ownership should be explicit;
- contexts where the generic word “Order” would otherwise be ambiguous.

Do not repeatedly prefix every UI label or sentence with “Pontivus”.

The former name **Gateweft** is migration/provenance terminology only. It is not a current public product name for this repository.
