/**
 * Contact feature — public contact page + Admin Inbox.
 */

export type {
  ContactMessageListItem,
  ContactMessageListResult,
  PublicClinicSchedule,
  PublicContactInfo,
  PublicContactPageData,
} from "./types";
export { toGoogleMapsEmbedUrl } from "./lib/maps-embed";
export { getPublicContactPageData } from "./services/get-public-contact-page-data";
export { createContactMessage } from "./services/create-contact-message";
export {
  countUnreadContactMessages,
  listContactMessages,
} from "./services/list-contact-messages";
export { updateContactMessageStatus } from "./services/update-contact-message-status";
export { deleteContactMessage } from "./services/delete-contact-message";
