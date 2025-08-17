import type Entity from "@/actual/things/Entity";
import type PlayerInfo from "@/communication/models/PlayerInfo";

export default interface JoinedMessage {
  entities: Entity[];
  players: PlayerInfo[];
}
