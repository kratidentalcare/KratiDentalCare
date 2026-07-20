"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FOOTER_LINK_GROUP_LABELS,
  FOOTER_LINK_GROUP_VALUES,
  type FooterLinkGroup,
} from "@/constants/clinic-settings";
import { updateClinicSettingsAction } from "@/features/clinic-settings/actions";
import type { ClinicSettingsView } from "@/features/clinic-settings/types";
import type { ClinicFooterLink } from "@/models/clinic-settings";
import {
  clinicFooterLinkFormSchema,
  type ClinicFooterLinkFormValues,
} from "@/validators/clinic-settings";

type FooterLinksManagerProps = {
  settings: ClinicSettingsView;
  onSaved: (patch: Partial<ClinicSettingsView>) => void;
};

type EditableLink = ClinicFooterLink & { key: string };

function withKeys(links: ClinicFooterLink[]): EditableLink[] {
  return links.map((link, index) => ({
    ...link,
    key: `${link.group}-${link.label}-${link.url}-${index}`,
  }));
}

function sortLinks(links: ClinicFooterLink[]): ClinicFooterLink[] {
  return [...links].sort((a, b) => {
    if (a.group !== b.group) {
      return a.group.localeCompare(b.group);
    }
    if (a.displayOrder !== b.displayOrder) {
      return a.displayOrder - b.displayOrder;
    }
    return a.label.localeCompare(b.label);
  });
}

const EMPTY_FORM: ClinicFooterLinkFormValues = {
  label: "",
  url: "/",
  group: "quickLinks",
  displayOrder: 0,
  isActive: true,
};

export function FooterLinksManager({
  settings,
  onSaved,
}: FooterLinksManagerProps) {
  const [links, setLinks] = useState(() => withKeys(settings.footerLinks));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EditableLink | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setLinks(withKeys(settings.footerLinks));
  }, [settings.footerLinks]);

  const form = useForm<ClinicFooterLinkFormValues>({
    resolver: zodResolver(clinicFooterLinkFormSchema),
    defaultValues: EMPTY_FORM,
  });

  const editing = useMemo(
    () => links.find((link) => link.key === editingKey) ?? null,
    [links, editingKey],
  );

  function openCreate() {
    setEditingKey(null);
    form.reset({
      ...EMPTY_FORM,
      displayOrder: links.length,
    });
    setDialogOpen(true);
  }

  function openEdit(link: EditableLink) {
    setEditingKey(link.key);
    form.reset({
      label: link.label,
      url: link.url,
      group: link.group,
      displayOrder: link.displayOrder,
      isActive: link.isActive,
    });
    setDialogOpen(true);
  }

  async function persist(next: ClinicFooterLink[]) {
    setPending(true);
    try {
      const payload = sortLinks(next);
      const result = await updateClinicSettingsAction({
        footerLinks: payload,
      });
      if (!result.success) {
        toast.error(result.error.message);
        return false;
      }
      setLinks(withKeys(payload));
      onSaved({ footerLinks: payload });
      toast.success("Footer links updated");
      return true;
    } finally {
      setPending(false);
    }
  }

  async function handleSubmit(values: ClinicFooterLinkFormValues) {
    const next = editing
      ? links.map((link) =>
          link.key === editing.key
            ? {
                label: values.label,
                url: values.url,
                group: values.group,
                displayOrder: values.displayOrder,
                isActive: values.isActive,
              }
            : {
                label: link.label,
                url: link.url,
                group: link.group,
                displayOrder: link.displayOrder,
                isActive: link.isActive,
              },
        )
      : [
          ...links.map((link) => ({
            label: link.label,
            url: link.url,
            group: link.group,
            displayOrder: link.displayOrder,
            isActive: link.isActive,
          })),
          values,
        ];

    const ok = await persist(next);
    if (ok) {
      setDialogOpen(false);
    }
  }

  async function handleToggle(link: EditableLink, isActive: boolean) {
    const next = links.map((item) =>
      item.key === link.key
        ? {
            label: item.label,
            url: item.url,
            group: item.group,
            displayOrder: item.displayOrder,
            isActive,
          }
        : {
            label: item.label,
            url: item.url,
            group: item.group,
            displayOrder: item.displayOrder,
            isActive: item.isActive,
          },
    );
    await persist(next);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    const next = links
      .filter((link) => link.key !== deleteTarget.key)
      .map((link) => ({
        label: link.label,
        url: link.url,
        group: link.group,
        displayOrder: link.displayOrder,
        isActive: link.isActive,
      }));
    const ok = await persist(next);
    if (ok) {
      setDeleteTarget(null);
    }
  }

  const sorted = useMemo(() => {
    return [...links].sort((a, b) => {
      if (a.group !== b.group) {
        return a.group.localeCompare(b.group);
      }
      if (a.displayOrder !== b.displayOrder) {
        return a.displayOrder - b.displayOrder;
      }
      return a.label.localeCompare(b.label);
    });
  }, [links]);

  return (
    <>
      <Card className="border-0 shadow-none ring-1 ring-[#E5E7EB]">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1.5">
            <CardTitle className="text-base font-semibold">
              Footer Links
            </CardTitle>
            <CardDescription>
              Manage Quick Links and Services shown in the public Footer.
              Internal paths (e.g. /about) and https:// URLs only.
            </CardDescription>
          </div>
          <Button
            type="button"
            size="sm"
            className="shrink-0"
            onClick={openCreate}
            disabled={pending}
          >
            <PlusIcon className="size-4" />
            Add link
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-xl ring-1 ring-[#E5E7EB]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Label</TableHead>
                  <TableHead className="hidden sm:table-cell">URL</TableHead>
                  <TableHead>Group</TableHead>
                  <TableHead className="hidden md:table-cell">Order</TableHead>
                  <TableHead>Visible</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-8 text-center text-sm text-brand-muted"
                    >
                      No footer links yet. Add Quick Links or Services links.
                    </TableCell>
                  </TableRow>
                ) : (
                  sorted.map((link) => (
                    <TableRow key={link.key}>
                      <TableCell className="font-medium">{link.label}</TableCell>
                      <TableCell className="hidden max-w-[14rem] truncate sm:table-cell">
                        {link.url}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {FOOTER_LINK_GROUP_LABELS[link.group]}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {link.displayOrder}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={link.isActive}
                          disabled={pending}
                          onCheckedChange={(checked) =>
                            handleToggle(link, checked)
                          }
                          aria-label={`Toggle ${link.label}`}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={pending}
                            onClick={() => openEdit(link)}
                            aria-label={`Edit ${link.label}`}
                          >
                            <PencilIcon className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={pending}
                            onClick={() => setDeleteTarget(link)}
                            aria-label={`Delete ${link.label}`}
                          >
                            <Trash2Icon className="size-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Footer Link" : "Add Footer Link"}
            </DialogTitle>
            <DialogDescription>
              Use an internal path like /contact or a full https:// URL.
            </DialogDescription>
          </DialogHeader>
          <form
            className="flex flex-col gap-4"
            onSubmit={form.handleSubmit(handleSubmit)}
            noValidate
          >
            <FormField
              id="footer-link-label"
              label="Label"
              error={form.formState.errors.label?.message}
              required
            >
              <Input
                className="h-10 rounded-xl"
                {...form.register("label")}
              />
            </FormField>

            <FormField
              id="footer-link-url"
              label="URL"
              error={form.formState.errors.url?.message}
              required
            >
              <Input
                className="h-10 rounded-xl"
                placeholder="/about or https://…"
                {...form.register("url")}
              />
            </FormField>

            <FormField
              id="footer-link-group"
              label="Group"
              error={form.formState.errors.group?.message}
              required
            >
              <Select
                value={form.watch("group")}
                onValueChange={(value) =>
                  form.setValue("group", value as FooterLinkGroup, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger className="h-10 w-full rounded-xl">
                  <SelectValue placeholder="Select group" />
                </SelectTrigger>
                <SelectContent>
                  {FOOTER_LINK_GROUP_VALUES.map((group) => (
                    <SelectItem key={group} value={group}>
                      {FOOTER_LINK_GROUP_LABELS[group]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField
              id="footer-link-order"
              label="Display Order"
              error={form.formState.errors.displayOrder?.message}
              required
            >
              <Input
                type="number"
                min={0}
                className="h-10 rounded-xl"
                {...form.register("displayOrder", { valueAsNumber: true })}
              />
            </FormField>

            <div className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2.5">
              <div>
                <p className="text-sm font-medium">Visible in Footer</p>
                <p className="text-xs text-brand-muted">
                  Hidden links are kept but not rendered publicly.
                </p>
              </div>
              <Switch
                checked={form.watch("isActive")}
                onCheckedChange={(checked) =>
                  form.setValue("isActive", checked, { shouldDirty: true })
                }
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={pending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? "Saving…" : editing ? "Save link" : "Add link"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete footer link?</AlertDialogTitle>
            <AlertDialogDescription>
              “{deleteTarget?.label}” will be removed from the Footer
              configuration.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={pending}
              onClick={(event) => {
                event.preventDefault();
                void handleDelete();
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
