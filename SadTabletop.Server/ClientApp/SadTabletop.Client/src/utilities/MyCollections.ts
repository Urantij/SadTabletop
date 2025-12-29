export function removeItemFromCollection<T>(array: Array<T>, item: T): boolean {

  const index = array.findIndex(i => i === item);

  if (index === -1) {
    return false;
  }

  array.splice(index, 1)[0];

  return true;
}

export function removeFromCollection<T>(array: Array<T>, predicate: (t: T) => boolean): T | undefined {

  const index = array.findIndex(predicate);

  if (index === -1) {
    return undefined;
  }

  return array.splice(index, 1)[0];
}

export function findForSure<T>(array: Array<T>, predicate: (t: T) => boolean): T {

  const index = array.findIndex(predicate);

  if (index === -1) {
    throw new Error(`не удалось найти элемент`)
  }

  return array[index];
}
