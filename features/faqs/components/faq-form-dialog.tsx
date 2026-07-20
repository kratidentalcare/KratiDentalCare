"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { FormField } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { FaqListItem } from "@/features/faqs/types";
import { createFaqActionSchema } from "@/validators/faq";

type FaqFormValues = z.infer<typeof createFaqActionSchema>;

type FaqFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: FaqListItem | null;
  pending: boolean;
  onSubmit: (values: FaqFormValues) => Promise<void>;
};

const EMPTY_VALUES: FaqFormValues = {
  question: "",
  answer: "",
  displayOrder: 0,
  isActive: true,
};

export function FaqFormDialog({
  open,
  onOpenChange,
  editing,
  pending,
  onSubmit,
}: FaqFormDialogProps) {
  const form = useForm<FaqFormValues>({
    resolver: zodResolver(createFaqActionSchema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (!open) return;
    if (editing) {
      form.reset({
        question: editing.question,
        answer: editing.answer,
        displayOrder: editing.displayOrder,
        isActive: editing.isActive,
      });
    } else {
      form.reset(EMPTY_VALUES);
    }
  }, [open, editing, form]);

  const isActive =
    useWatch({ control: form.control, name: "isActive" }) ?? true;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit FAQ" : "Add FAQ"}</DialogTitle>
          <DialogDescription>
            {editing
              ? "Update the question, answer, order, or visibility."
              : "Create a new FAQ for the public homepage."}
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
        >
          <FormField
            id="faq-question"
            label="Question"
            error={form.formState.errors.question?.message}
            required
          >
            <Input
              className="h-10 rounded-xl"
              placeholder="How can I book an appointment?"
              {...form.register("question")}
            />
          </FormField>

          <FormField
            id="faq-answer"
            label="Answer"
            error={form.formState.errors.answer?.message}
            required
          >
            <Textarea
              className="min-h-28 rounded-xl"
              placeholder="Provide a clear, helpful answer…"
              {...form.register("answer")}
            />
          </FormField>

          <FormField
            id="faq-display-order"
            label="Display order"
            description="Lower numbers appear first on the homepage."
            error={form.formState.errors.displayOrder?.message}
            required
          >
            <Input
              type="number"
              min={0}
              step={1}
              className="h-10 rounded-xl"
              {...form.register("displayOrder")}
            />
          </FormField>

          <div className="flex items-center justify-between gap-3 rounded-xl border border-[#E5E7EB] px-3 py-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-brand-dark">Active</p>
              <p className="text-xs text-brand-muted">
                Hidden FAQs stay in the dashboard but are not shown publicly.
              </p>
            </div>
            <Switch
              checked={isActive}
              onCheckedChange={(checked) =>
                form.setValue("isActive", checked, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              aria-label="FAQ active status"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-xl bg-brand-blue hover:bg-brand-blue/90"
              disabled={pending}
            >
              {pending ? "Saving…" : editing ? "Update FAQ" : "Create FAQ"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
