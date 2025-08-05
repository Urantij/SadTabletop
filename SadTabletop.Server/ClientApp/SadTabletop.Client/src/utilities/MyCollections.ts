export function removeFromCollection<T>(array: Array<T>, predicate: (t: T) => boolean): T | undefined {

    const index = array.findIndex(predicate);

    if (index === -1) {
        return undefined;
    }

    return array.splice(index, 1)[0];
}