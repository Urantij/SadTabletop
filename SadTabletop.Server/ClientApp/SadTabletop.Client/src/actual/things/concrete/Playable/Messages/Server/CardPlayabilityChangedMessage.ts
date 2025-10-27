export default interface CardPlayabilityChangedMessage {
  card: number;
  owner: number;
  targets: number[] | null;
}
