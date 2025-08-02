import Table from "./Table";

/**
 * Хранит все данные игры.
 */
export default class LeGame {

    public readonly table: Table = new Table();

    public readonly sidesData: { num: number, path: string }[] = [];

    constructor() {
    }
}