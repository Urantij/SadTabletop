import type ChatMessage from "@/actual/things/concrete/Chat/ChatMessage";
import type Entity from "@/actual/things/Entity";
import type PlayerInfo from "@/communication/models/PlayerInfo";

export default interface JoinedMessage {
  playerId: number;
  entities: Entity[];
  players: PlayerInfo[];
  messages: ChatMessage[];
}
