"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { FormField } from "@/components/shared/form-field";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  createHolidayAction,
  deleteHolidayAction,
  updateHolidayAction,
} from "@/features/scheduling/actions";
import { DatePickerField } from "@/features/scheduling/components/date-picker-field";
import { formatCivilDateLabel } from "@/features/scheduling/lib/civil-date";
import type { HolidayListItem } from "@/features/scheduling/types";
import { createHolidayActionSchema } from "@/validators/holiday";

type HolidayFormValues = z.infer<typeof createHolidayActionSchema>;

type HolidaysPanelProps = {
  initialHolidays: HolidayListItem[];
};

export function HolidaysPanel({ initialHolidays }: HolidaysPanelProps) {
  const [holidays, setHolidays] = useState(initialHolidays);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<HolidayListItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const form = useForm<HolidayFormValues>({
    resolver: zodResolver(createHolidayActionSchema),
    defaultValues: {
      date: "",
      reason: "",
      isRecurring: false,
    },
  });

  const holidayDate = useWatch({ control: form.control, name: "date" }) ?? "";
  const isRecurring =
    useWatch({ control: form.control, name: "isRecurring" }) ?? false;

  function openCreate() {
    setEditing(null);
    form.reset({ date: "", reason: "", isRecurring: false });
    setDialogOpen(true);
  }

  function openEdit(item: HolidayListItem) {
    setEditing(item);
    form.reset({
      date: item.date,
      reason: item.reason,
      isRecurring: item.isRecurring,
    });
    setDialogOpen(true);
  }

  async function onSubmit(values: HolidayFormValues) {
    setPending(true);
    try {
      if (editing) {
        const result = await updateHolidayAction({
          id: editing.id,
          data: values,
        });
        if (!result.success) {
          toast.error(result.error.message);
          return;
        }
        setHolidays((prev) =>
          prev.map((item) =>
            item.id === editing.id
              ? {
                  ...item,
                  date: values.date,
                  reason: values.reason,
                  isRecurring: values.isRecurring,
                }
              : item,
          ),
        );
        toast.success("Holiday updated");
      } else {
        const result = await createHolidayAction(values);
        if (!result.success) {
          toast.error(result.error.message);
          return;
        }
        setHolidays((prev) =>
          [
            ...prev,
            {
              id: result.data.id,
              date: values.date,
              reason: values.reason,
              isRecurring: values.isRecurring,
              isActive: true,
            },
          ].sort((a, b) => a.date.localeCompare(b.date)),
        );
        toast.success("Holiday created");
      }
      setDialogOpen(false);
    } finally {
      setPending(false);
    }
  }

  async function confirmDelete() {
    if (!deleteId) return;
    setPending(true);
    try {
      const result = await deleteHolidayAction({ id: deleteId });
      if (!result.success) {
        toast.error(result.error.message);
        return;
      }
      setHolidays((prev) => prev.filter((item) => item.id !== deleteId));
      toast.success("Holiday deleted");
      setDeleteId(null);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <Card className="border-0 bg-white shadow-none ring-1 ring-[#E5E7EB]">
        <CardHeader className="flex flex-row items-start justify-between gap-3 border-b border-[#E5E7EB]">
          <div className="space-y-1">
            <CardTitle className="font-montserrat text-base font-semibold text-brand-dark">
              Holiday Management
            </CardTitle>
            <CardDescription>
              Mark one-off or recurring closed days. The availability engine
              returns “Clinic Closed” for these dates.
            </CardDescription>
          </div>
          <Button
            type="button"
            size="sm"
            className="rounded-xl bg-brand-blue hover:bg-brand-blue/90"
            onClick={openCreate}
          >
            <PlusIcon className="size-4" />
            Add holiday
          </Button>
        </CardHeader>
        <CardContent className="pt-4">
          {holidays.length === 0 ? (
            <p className="rounded-xl border border-dashed border-[#E5E7EB] px-4 py-8 text-center text-sm text-brand-muted">
              No holidays configured yet.
            </p>
          ) : (
            <ul className="divide-y divide-[#E5E7EB] rounded-xl border border-[#E5E7EB]">
              {holidays.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 space-y-1">
                    <p className="font-medium text-brand-dark">{item.reason}</p>
                    <p className="text-sm text-brand-muted">
                      {formatCivilDateLabel(item.date)}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {item.isRecurring ? (
                        <Badge variant="secondary">Recurring yearly</Badge>
                      ) : (
                        <Badge variant="outline">One-time</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-xl"
                      onClick={() => openEdit(item)}
                    >
                      <PencilIcon className="size-3.5" />
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="rounded-xl text-destructive"
                      onClick={() => setDeleteId(item.id)}
                    >
                      <Trash2Icon className="size-3.5" />
                      Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit holiday" : "Create holiday"}
            </DialogTitle>
            <DialogDescription>
              Holidays close the clinic for the entire day.
            </DialogDescription>
          </DialogHeader>
          <form
            className="flex flex-col gap-4"
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
          >
            <FormField
              id="holiday-date"
              label="Date"
              error={form.formState.errors.date?.message}
              required
            >
              <DatePickerField
                id="holiday-date"
                value={holidayDate}
                onChange={(value) =>
                  form.setValue("date", value, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
              />
            </FormField>
            <FormField
              id="holiday-reason"
              label="Reason"
              error={form.formState.errors.reason?.message}
              required
            >
              <Input
                className="h-10 rounded-xl"
                placeholder="Diwali / Clinic renovation"
                {...form.register("reason")}
              />
            </FormField>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={isRecurring}
                onCheckedChange={(value) =>
                  form.setValue("isRecurring", value === true, {
                    shouldDirty: true,
                  })
                }
              />
              Recurring every year on this date
            </label>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-xl bg-brand-blue hover:bg-brand-blue/90"
                disabled={pending}
              >
                {pending ? "Saving…" : editing ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteId != null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete holiday?</AlertDialogTitle>
            <AlertDialogDescription>
              This date will become bookable again (subject to working days and
              other blocks).
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
