export interface CursorInfo {
  playerId: number;
  x: number;
  y: number;
}

export interface CursorsInfoMessage {
  cursors: CursorInfo[];
}
