export default interface DeckCardInsertedMessage {
  deck: number;
  card: number;

  side: number | null;

  cardFront: number | null;
  deckIndex: number | null;
}
