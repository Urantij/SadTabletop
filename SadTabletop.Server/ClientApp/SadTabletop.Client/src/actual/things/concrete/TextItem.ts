import type TableItem from "../TableItem";

export default interface TextItem extends TableItem {
  content: string;
  width: number;
  height: number;
}
