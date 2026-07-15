/**
 * Authorization entry: active Mongo app user with a known role.
 *
 * Implementation lives with the authentication helper layer so soft/hard
 * reads share one active-user assertion (no duplicated logic).
 */
import "server-only";

export {
  assertActiveAppUser,
  getCurrentUserOrThrow as requireAppUser,
} from "./get-current-user";
