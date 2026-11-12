# Contributing to Order

Order is a public repository. All changes are delivered through pull requests to `master`; direct delivery to `master` is not an accepted contribution path.

The canonical contribution, versioning, changelog, tagging and release rules are defined by:

- [Public repository delivery and release standard](docs/15-public-repository-delivery-and-release.md)
- [Repository operating rules](AGENTS.md)

Before opening a PR:

1. branch from current `master`;
2. keep the change cohesive;
3. update `CHANGELOG.md` under `[Unreleased]`;
4. declare the SemVer release impact and intended release train in the PR;
5. run the repository verification gates applicable to the change.

The repository's canonical build/test commands are defined in `pontivus-order.toml`.
