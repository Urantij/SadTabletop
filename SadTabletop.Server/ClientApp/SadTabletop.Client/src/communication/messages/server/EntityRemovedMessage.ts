import type EntityLinkWrap from "@/communication/models/EntityLinkWrap";

export default interface EntityRemovedMessage {
  entity: EntityLinkWrap;
}
