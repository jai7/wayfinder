export const DAILY_DRILLS = [
  {
    id: "d1", title: "Shadow Direction",
    description: "Look at your shadow right now. Which direction are you facing? Verify with a compass app after guessing.",
    xp: 15, duration: "1 min", icon: "sun", category: "Cardinal Directions",
  },
  {
    id: "d2", title: "Home Point",
    description: "Without looking at any map, point toward your home from where you are right now. Then verify.",
    xp: 15, duration: "1 min", icon: "target", category: "Spatial Memory",
  },
  {
    id: "d3", title: "Street Name Quiz",
    description: "Name 5 streets within a 10-minute walk of where you are right now — without using any map.",
    xp: 20, duration: "2 min", icon: "route", category: "Neighborhood",
  },
  {
    id: "d4", title: "Mental Snapshot",
    description: "Close your eyes and picture the last intersection you passed. What were the four street names? What landmarks were on each corner?",
    xp: 20, duration: "3 min", icon: "landmark", category: "Observation",
  },
  {
    id: "d5", title: "Reverse Commute",
    description: "Mentally retrace your commute or last walk step by step — every turn reversed, every landmark from the opposite side.",
    xp: 20, duration: "3 min", icon: "refresh", category: "Mental Rotation",
  },
  {
    id: "d6", title: "North Star Hunt",
    description: "Tonight, find North using only the stars. Polaris sits at the end of the Little Dipper's handle.",
    xp: 25, duration: "5 min", icon: "compass", category: "Cardinal Directions",
  },
  {
    id: "d7", title: "Sketch from Memory",
    description: "Draw a rough map of your neighborhood from memory — streets, landmarks, parks. No peeking at any map.",
    xp: 25, duration: "5 min", icon: "map", category: "Mental Mapping",
  },
];

/**
 * Returns 3 drills deterministically for today.
 * Same 3 drills all day, new set tomorrow.
 */
export function getDailyDrills() {
  const seed = Math.floor(Date.now() / 86_400_000);
  return [...DAILY_DRILLS]
    .map((drill, i) => ({
      drill,
      sort: Math.sin(seed * 9301 + i * 49297) * 233280,
    }))
    .sort((a, b) => a.sort - b.sort)
    .slice(0, 3)
    .map(({ drill }) => drill);
}
