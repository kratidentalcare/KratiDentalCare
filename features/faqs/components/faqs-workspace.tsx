"use client";

import { useState } from "react";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

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
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  createFaqAction,
  deleteFaqAction,
  toggleFaqVisibilityAction,
  updateFaqAction,
} from "@/features/faqs/actions";
import { FaqFormDialog } from "@/features/faqs/components/faq-form-dialog";
import { FaqsTable } from "@/features/faqs/components/faqs-table";
import type { FaqListItem } from "@/features/faqs/types";
import { createFaqActionSchema } from "@/validators/faq";

type FaqFormValues = z.infer<typeof createFaqActionSchema>;

type FaqsWorkspaceProps = {
  initialFaqs: FaqListItem[];
};

function sortFaqs(items: FaqListItem[]): FaqListItem[] {
  return [...items].sort((a, b) => {
    if (a.displayOrder !== b.displayOrder) {
      return a.displayOrder - b.displayOrder;
    }
    return a.createdAt.localeCompare(b.createdAt);
  });
}

export function FaqsWorkspace({ initialFaqs }: FaqsWorkspaceProps) {
  const [faqs, setFaqs] = useState(initialFaqs);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<FaqListItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FaqListItem | null>(null);
  const [pending, setPending] = useState(false);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(item: FaqListItem) {
    setEditing(item);
    setDialogOpen(true);
  }

  async function handleSubmit(values: FaqFormValues) {
    setPending(true);
    try {
      if (editing) {
        const result = await updateFaqAction({
          id: editing.id,
          data: values,
        });
        if (!result.success) {
          toast.error(result.error.message);
          return;
        }
        setFaqs((prev) =>
          sortFaqs(
            prev.map((item) =>
              item.id === editing.id
                ? {
                    ...item,
                    question: values.question,
                    answer: values.answer,
                    displayOrder: values.displayOrder,
                    isActive: values.isActive,
                    updatedAt: new Date().toISOString(),
                  }
                : item,
            ),
          ),
        );
        toast.success("FAQ updated successfully.");
      } else {
        const result = await createFaqAction(values);
        if (!result.success) {
          toast.error(result.error.message);
          return;
        }
        const now = new Date().toISOString();
        setFaqs((prev) =>
          sortFaqs([
            ...prev,
            {
              id: result.data.id,
              question: values.question,
              answer: values.answer,
              displayOrder: values.displayOrder,
              isActive: values.isActive,
              createdAt: now,
              updatedAt: now,
            },
          ]),
        );
        toast.success("FAQ created successfully.");
      }
      setDialogOpen(false);
      setEditing(null);
    } finally {
      setPending(false);
    }
  }

  async function handleToggleVisibility(item: FaqListItem) {
    setPending(true);
    try {
      const nextActive = !item.isActive;
      const result = await toggleFaqVisibilityAction({
        id: item.id,
        isActive: nextActive,
      });
      if (!result.success) {
        toast.error(result.error.message);
        return;
      }
      setFaqs((prev) =>
        prev.map((faq) =>
          faq.id === item.id
            ? {
                ...faq,
                isActive: result.data.isActive,
                updatedAt: new Date().toISOString(),
              }
            : faq,
        ),
      );
      toast.success("FAQ visibility updated.");
    } finally {
      setPending(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setPending(true);
    try {
      const result = await deleteFaqAction({ id: deleteTarget.id });
      if (!result.success) {
        toast.error(result.error.message);
        return;
      }
      setFaqs((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      toast.success("FAQ deleted successfully.");
      setDeleteTarget(null);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <Card className="border-0 bg-white shadow-none ring-1 ring-[#E5E7EB]">
        <CardHeader className="flex flex-col gap-3 border-b border-[#E5E7EB] sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="font-montserrat text-base font-semibold text-brand-dark">
              FAQ Management
            </CardTitle>
            <CardDescription>
              Manage questions shown on the public homepage. Only Active FAQs
              are published.
            </CardDescription>
          </div>
          <Button
            type="button"
            size="sm"
            className="w-full rounded-xl bg-brand-blue hover:bg-brand-blue/90 sm:w-auto"
            onClick={openCreate}
          >
            <PlusIcon className="size-4" />
            Add FAQ
          </Button>
        </CardHeader>
        <CardContent className="pt-4">
          <FaqsTable
            items={faqs}
            onEdit={openEdit}
            onToggleVisibility={handleToggleVisibility}
            onDelete={setDeleteTarget}
          />
        </CardContent>
      </Card>

      <FaqFormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditing(null);
        }}
        editing={editing}
        pending={pending}
        onSubmit={handleSubmit}
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
              Are you sure you want to delete this FAQ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
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
    </>
  );
}
