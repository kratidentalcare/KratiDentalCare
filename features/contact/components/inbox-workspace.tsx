"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import {
  ListToolbar,
  PaginationControls,
  SearchInput,
} from "@/components/shared";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CONTACT_MESSAGE_STATUSES } from "@/constants/statuses";
import {
  deleteContactMessageAction,
  updateContactMessageStatusAction,
} from "@/features/contact/actions";
import { InboxMessageSheet } from "@/features/contact/components/inbox-message-sheet";
import { InboxTable } from "@/features/contact/components/inbox-table";
import type {
  ContactMessageListItem,
  ContactMessageListResult,
} from "@/features/contact/types";

type InboxWorkspaceProps = {
  initialData: ContactMessageListResult;
};

export function InboxWorkspace({ initialData }: InboxWorkspaceProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isRefreshing, startRefresh] = useTransition();
  const [pending, setPending] = useState(false);
  const [searchValue, setSearchValue] = useState(
    () => searchParams.get("search") ?? "",
  );
  const [selected, setSelected] = useState<ContactMessageListItem | null>(null);
  const [deleteTarget, setDeleteTarget] =
    useState<ContactMessageListItem | null>(null);

  const filters = useMemo(
    () => ({
      search: searchParams.get("search") ?? "",
      status: searchParams.get("status") ?? "all",
      page: Number(searchParams.get("page") ?? "1"),
    }),
    [searchParams],
  );

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "" || value === "all") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      router.replace(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams],
  );

  const refresh = useCallback(() => {
    startRefresh(() => {
      router.refresh();
    });
  }, [router]);

  async function handleStatusChange(
    item: ContactMessageListItem,
    status:
      | typeof CONTACT_MESSAGE_STATUSES.NEW
      | typeof CONTACT_MESSAGE_STATUSES.READ
      | typeof CONTACT_MESSAGE_STATUSES.ARCHIVED,
    successMessage: string,
  ) {
    setPending(true);
    try {
      const result = await updateContactMessageStatusAction({
        id: item.id,
        status,
      });
      if (!result.success) {
        toast.error(result.error.message);
        return;
      }
      setSelected((prev) =>
        prev?.id === result.data.id ? result.data : prev,
      );
      toast.success(successMessage);
      refresh();
    } finally {
      setPending(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setPending(true);
    try {
      const result = await deleteContactMessageAction({ id: deleteTarget.id });
      if (!result.success) {
        toast.error(result.error.message);
        return;
      }
      if (selected?.id === deleteTarget.id) {
        setSelected(null);
      }
      toast.success("Inquiry deleted.");
      setDeleteTarget(null);
      refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <Card className="border-0 shadow-none ring-1 ring-[#E5E7EB]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Inbox</CardTitle>
          <CardDescription>
            Review messages submitted from the public contact form. Newest
            inquiries appear first.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ListToolbar
            start={
              <div className="grid gap-3 sm:grid-cols-[1fr_12rem]">
                <SearchInput
                  value={searchValue}
                  placeholder="Search name, email, phone, or subject…"
                  onValueChange={setSearchValue}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      updateParams({
                        search: searchValue.trim() || null,
                        page: "1",
                      });
                    }
                  }}
                  onClear={() => {
                    setSearchValue("");
                    updateParams({ search: null, page: "1" });
                  }}
                />
                <Select
                  value={filters.status || "all"}
                  onValueChange={(value) =>
                    updateParams({
                      status: value === "all" ? null : value,
                      page: "1",
                    })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value={CONTACT_MESSAGE_STATUSES.NEW}>
                      New
                    </SelectItem>
                    <SelectItem value={CONTACT_MESSAGE_STATUSES.READ}>
                      Read
                    </SelectItem>
                    <SelectItem value={CONTACT_MESSAGE_STATUSES.ARCHIVED}>
                      Archived
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            }
          />
        </CardContent>
      </Card>

      <div className="relative rounded-xl ring-1 ring-[#E5E7EB]">
        {isRefreshing ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/60">
            <Loader2Icon className="size-6 animate-spin text-brand-blue" />
          </div>
        ) : null}
        <div className="p-3 sm:p-4">
          <InboxTable
            items={initialData.items}
            onOpen={setSelected}
            onMarkRead={(item) =>
              handleStatusChange(
                item,
                CONTACT_MESSAGE_STATUSES.READ,
                "Marked as read.",
              )
            }
            onMarkUnread={(item) =>
              handleStatusChange(
                item,
                CONTACT_MESSAGE_STATUSES.NEW,
                "Marked as unread.",
              )
            }
            onArchive={(item) =>
              handleStatusChange(
                item,
                CONTACT_MESSAGE_STATUSES.ARCHIVED,
                "Inquiry archived.",
              )
            }
            onDelete={setDeleteTarget}
          />
        </div>
      </div>

      <PaginationControls
        page={initialData.pagination.page}
        pageSize={initialData.pagination.limit}
        totalItems={initialData.pagination.total}
        onPageChange={(page) => updateParams({ page: String(page) })}
      />

      <InboxMessageSheet
        message={selected}
        open={selected !== null}
        pending={pending}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        onMarkRead={(item) =>
          handleStatusChange(
            item,
            CONTACT_MESSAGE_STATUSES.READ,
            "Marked as read.",
          )
        }
        onMarkUnread={(item) =>
          handleStatusChange(
            item,
            CONTACT_MESSAGE_STATUSES.NEW,
            "Marked as unread.",
          )
        }
        onArchive={(item) =>
          handleStatusChange(
            item,
            CONTACT_MESSAGE_STATUSES.ARCHIVED,
            "Inquiry archived.",
          )
        }
        onDelete={setDeleteTarget}
      />

      <AlertDialog
        open={deleteTarget != null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete this inquiry?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the message from the inbox. This action cannot
              be undone from the dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl"
              onClick={confirmDelete}
              disabled={pending}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
