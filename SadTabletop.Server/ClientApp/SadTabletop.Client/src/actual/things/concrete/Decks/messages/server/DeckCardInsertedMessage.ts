export default interface DeckCardInsertedMessage {
  deck: number;
  card: number;

  side: number | null;

  cardFront: number | null;
  cardIndex: number | null;
}
