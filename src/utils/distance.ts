interface HasDistance {
  distanceWalkMin: number | null;
  distanceDriveMin: number | null;
}

/** Walk and drive minutes aren't the same unit — a 10-minute walk isn't
 * "further" than a 5-minute drive, it's a different kind of close. So
 * walking-distance items always sort before driving-distance items (real
 * offset, not just alphabetical luck: no realistic walk is >1000min), each
 * group ordered by its own minutes; items with neither go last. */
export function distanceSortKey(item: HasDistance): number {
  if (item.distanceWalkMin != null) return item.distanceWalkMin;
  if (item.distanceDriveMin != null) return 1000 + item.distanceDriveMin;
  return Infinity;
}
