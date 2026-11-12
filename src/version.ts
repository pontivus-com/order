import packageMetadata from "../package.json" with { type: "json" };

const semanticVersionPattern = /^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$/;

if (!semanticVersionPattern.test(packageMetadata.version)) {
  throw new TypeError("package.json version must be a MAJOR.MINOR.PATCH semantic version");
}

export const orderVersion = packageMetadata.version;
