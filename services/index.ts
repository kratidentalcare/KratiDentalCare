/**
 * Business logic / data-access services.
 * Keep UI components free of direct database calls.
 *
 * Scheduling domain services live under `features/scheduling/services`
 * so the feature stays cohesive (engine + repositories + actions).
 */

export { generateAvailableSlots } from "@/features/scheduling/services/generate-available-slots";
