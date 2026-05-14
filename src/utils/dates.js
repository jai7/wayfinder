/**
 * Returns a stable string key for today, used to scope daily drill resets.
 */
export function todayKey() {
  return new Date().toDateString();
}

/**
 * Returns a time-of-day greeting.
 */
export function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

/**
 * Groups an array of activity entries (sorted newest-first) into
 * labelled buckets: Today, Yesterday, This Week, then Month Year.
 *
 * @param {Array} entries - each must have a `createdAt` (timestamp ms)
 * @returns {Array<{ label: string, entries: Array }>}
 */
export function groupByDate(entries) {
  const now       = new Date();
  const today     = startOfDay(now);
  const yesterday = startOfDay(new Date(today.getTime() - 86_400_000));
  const weekAgo   = startOfDay(new Date(today.getTime() - 7 * 86_400_000));

  const buckets = new Map();

  for (const entry of entries) {
    const d = startOfDay(new Date(entry.createdAt));
    let label;

    if (d.getTime() === today.getTime())          label = "Today";
    else if (d.getTime() === yesterday.getTime()) label = "Yesterday";
    else if (d.getTime() > weekAgo.getTime())     label = "This Week";
    else label = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });

    if (!buckets.has(label)) buckets.set(label, []);
    buckets.get(label).push(entry);
  }

  // Maintain logical order: Today → Yesterday → This Week → older (desc)
  const fixed    = ["Today", "Yesterday", "This Week"];
  const allKeys  = [...buckets.keys()];
  const ordered  = [
    ...fixed.filter(k => buckets.has(k)),
    ...allKeys.filter(k => !fixed.includes(k)),
  ];

  return ordered.map(label => ({ label, entries: buckets.get(label) }));
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}
