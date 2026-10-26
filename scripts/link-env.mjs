// Next.js ne lit que les .env de son propre dossier (apps/web).
// Ce script y crée un lien symbolique vers le .env unique de la racine du monorepo.
import { existsSync, lstatSync, readlinkSync, symlinkSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const source = join(root, ".env");
const target = join(root, "apps/web/.env");
const relative = "../../.env";

if (!existsSync(source)) {
  console.warn("⚠ .env introuvable à la racine : copiez .env.example en .env");
  process.exit(0);
}

if (existsSync(target) || isBrokenLink(target)) {
  const stat = lstatSync(target);
  if (stat.isSymbolicLink() && readlinkSync(target) === relative) process.exit(0);
  console.warn("⚠ apps/web/.env existe déjà et n'est pas un lien vers le .env racine : laissé intact");
  process.exit(0);
}

symlinkSync(relative, target);
console.log("✓ apps/web/.env → .env (racine)");

function isBrokenLink(path) {
  try {
    return lstatSync(path).isSymbolicLink();
  } catch {
    return false;
  }
}
