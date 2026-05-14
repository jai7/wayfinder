export const LEVELS = [
  { name: "Lost Lamb",        min: 0,    emoji: "🐑" },
  { name: "Curious Wanderer", min: 100,  emoji: "🚶" },
  { name: "Street Scout",     min: 250,  emoji: "🔍" },
  { name: "Landmark Keeper",  min: 500,  emoji: "🏛️" },
  { name: "Urban Wayfinder",  min: 900,  emoji: "🧭" },
  { name: "Local Legend",     min: 1500, emoji: "⭐" },
];

export const SKILLS = [
  { id: "observation", label: "Observation",      color: "#34C759" },
  { id: "cardinal",    label: "Cardinal Dirs",    color: "#007AFF" },
  { id: "mental_map",  label: "Mental Mapping",   color: "#FF9500" },
  { id: "landmark",    label: "Landmark Memory",  color: "#AF52DE" },
  { id: "confidence",  label: "GPS Independence", color: "#FF3B30" },
];

export const SKILL_MAP = {
  "Observation":        "observation",
  "Cardinal Directions":"cardinal",
  "Mental Mapping":     "mental_map",
  "Neighborhood":       "landmark",
  "Orientation":        "mental_map",
  "Mental Rotation":    "mental_map",
  "Spatial Memory":     "observation",
  "GPS Detox":          "confidence",
};

export const AVATAR_COLORS = [
  ["#E8F4FF", "#007AFF"],
  ["#E8F9EE", "#34C759"],
  ["#FFF3E0", "#FF9500"],
  ["#F3E5F5", "#AF52DE"],
  ["#FFEBEE", "#FF3B30"],
  ["#E0F2F1", "#009688"],
];
