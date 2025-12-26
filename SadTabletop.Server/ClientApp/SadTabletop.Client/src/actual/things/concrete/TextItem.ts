import type TableItem from "./Table/TableItem";

export default interface TextItem extends TableItem {
  content: string;
  width: number;
  height: number;
}
