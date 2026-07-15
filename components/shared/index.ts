/**
 * Cross-feature presentational blocks — compose ui/ primitives.
 * Domain-aware styling allowed (status maps); no data fetching or business rules.
 */

export { ConfirmDialog, type ConfirmDialogProps } from "./confirm-dialog";
export { Container, type ContainerProps } from "./container";
export {
  DataTable,
  type DataTableColumn,
  type DataTableProps,
} from "./data-table";
export { EmptyState, type EmptyStateProps } from "./empty-state";
export { ErrorMessage, type ErrorMessageProps } from "./error-message";
export { FormField, type FormFieldProps } from "./form-field";
export { ListToolbar, type ListToolbarProps } from "./list-toolbar";
export { LoadingState, type LoadingStateProps } from "./loading-state";
export { PageHeader, type PageHeaderProps } from "./page-header";
export {
  PaginationControls,
  type PaginationControlsProps,
} from "./pagination-controls";
export { SearchInput, type SearchInputProps } from "./search-input";
export { Section, type SectionProps } from "./section";
export { Spinner, type SpinnerProps } from "./spinner";
export { StatusBadge, type StatusBadgeProps } from "./status-badge";
export {
  getStatusVisual,
  STATUS_VISUALS,
  type DomainStatus,
  type StatusTone,
  type StatusVisual,
} from "./status-badge.config";
export { UserAvatar, type UserAvatarProps } from "./user-avatar";
