export function updateItemInList<T extends { _id: string }>(
  list: T[],
  id: string,
  updates: Partial<T>
): T[] {
  return list.map((item) => (item._id === id ? { ...item, ...updates } : item));
}

export function removeItemFromList<T extends { _id: string }>(list: T[], id: string): T[] {
  return list.filter((item) => item._id !== id);
}
