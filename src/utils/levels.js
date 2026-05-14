import { LEVELS } from "../data/levels.js";

export function getLevel(xp) {
  return [...LEVELS].reverse().find(l => xp >= l.min) ?? LEVELS[0];
}

export function getNextLevel(xp) {
  return LEVELS.find(l => xp < l.min) ?? LEVELS[LEVELS.length - 1];
}

/**
 * Returns up to 2 uppercase initials from a display name.
 * "Alex Chen" → "AC", "Priya" → "P"
 */
export function initials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .map(w => w[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");
}
