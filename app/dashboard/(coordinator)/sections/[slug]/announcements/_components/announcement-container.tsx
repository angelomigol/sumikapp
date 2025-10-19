"use client";

import React, { useState } from "react";

import { Edit, Megaphone, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  Announcement,
  useFetchAnnouncements,
  useRevalidateFetchAnnouncements,
} from "@/hooks/use-announcements";

import { safeFormatDate } from "@/utils/shared";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ConfirmationDialog from "@/components/sumikapp/confirmation-dialog";
import CustomSearchbar from "@/components/sumikapp/custom-search-bar";
import { If } from "@/components/sumikapp/if";
import { LoadingOverlay } from "@/components/sumikapp/loading-overlay";
import PageTitle from "@/components/sumikapp/page-title";

import NotFoundPage from "@/app/not-found";

import { deleteAnnouncementAction } from "../server/server-actions";
import AddEditAnnouncementDialog from "./add-edit-announcement-dialog";

export default function AnnouncementContainer(params: { slug: string }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null);

  const { data: announcements = [], isLoading } = useFetchAnnouncements(
    params.slug
  );
  const [announcementDialogOpen, setAnnouncementDialogOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogConfig, setDialogConfig] = useState<{
    title: string;
    description: string;
    onConfirm: () => void;
    confirmText: string;
    variant: "default" | "destructive";
  } | null>(null);

  const openConfirmDialog = (config: typeof dialogConfig) => {
    setDialogConfig(config);
    setDialogOpen(true);
  };

  const revalidateAnnouncements = useRevalidateFetchAnnouncements();

  const handleEdit = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setAnnouncementDialogOpen(true);
  };

  const toggleExpanded = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (isLoading) {
    return <LoadingOverlay />;
  }

  if (!params.slug) {
    return <NotFoundPage />;
  }

  const getTextFromHtml = (html: string) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const getExcerpt = (html: string, length = 120) => {
    const text = getTextFromHtml(html);
    if (text.length <= length) return text;
    return text.slice(0, length) + "...";
  };

  const filteredAnnouncements = announcements.filter((a) => {
    const query = searchQuery.toLowerCase();
    return (
      a.title.toLowerCase().includes(query) ||
      a.content.toLowerCase().includes(query)
    );
  });

  return (
    <>
      <div className="flex items-center justify-between">
        <PageTitle text={"Announcements"} />

        <AddEditAnnouncementDialog
          open={announcementDialogOpen}
          setOpen={setAnnouncementDialogOpen}
          editingAnnouncement={selectedAnnouncement}
          handleAdd={() => setSelectedAnnouncement(null)}
          slug={params.slug}
        />
      </div>

      <div className="flex items-center gap-4">
        <CustomSearchbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          placeholder="Search announcements"
        />
      </div>

      <div className="flex-1 space-y-6">
        <If
          condition={announcements.length === 0}
          fallback={
            <>
              <If
                condition={filteredAnnouncements.length === 0}
                fallback={
                  <>
                    {filteredAnnouncements.map((a) => (
                      <Card key={a.id} className="rounded-2xl">
                        <CardHeader className="pb-2">
                          <CardTitle>{a.title}</CardTitle>
                          <CardDescription>
                            {safeFormatDate(a.createdAt, "PPp")}
                          </CardDescription>
                          <CardAction className="text-muted-foreground">
                            <Button
                              size={"icon"}
                              variant={"ghost"}
                              onClick={() => handleEdit(a)}
                            >
                              <Edit className="size-4" />
                            </Button>
                            <Button
                              size={"icon"}
                              variant={"ghost"}
                              onClick={() => {
                                const formData = new FormData();
                                formData.append("id", a.id);

                                openConfirmDialog({
                                  title: `Delete ${a.title}`,
                                  description: `Are you sure you want to delete this announcement? This action cannot be undone.`,
                                  onConfirm: () => {
                                    toast.promise(
                                      deleteAnnouncementAction(formData),
                                      {
                                        loading: `Deleting announcement...`,
                                        success: () => {
                                          revalidateAnnouncements(params.slug);
                                          return `Announcement deleted successfully!`;
                                        },
                                        error: (err) =>
                                          err instanceof Error
                                            ? err.message
                                            : `Something went wrong while deleting announcement.`,
                                      }
                                    );
                                  },
                                  confirmText: "Delete",
                                  variant: "destructive",
                                });
                              }}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </CardAction>
                        </CardHeader>
                        <CardContent className="max-h-[400px] overflow-y-auto">
                          <div className="text-sm">
                            <If
                              condition={expanded[a.id]}
                              fallback={getExcerpt(a.content)}
                            >
                              <div
                                dangerouslySetInnerHTML={{ __html: a.content }}
                              />
                            </If>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-end">
                          <If condition={a.content.length > 120}>
                            <Button
                              size={"sm"}
                              variant={"ghost"}
                              onClick={() => toggleExpanded(a.id)}
                            >
                              <If
                                condition={expanded[a.id]}
                                fallback={"View more"}
                              >
                                View less
                              </If>
                            </Button>
                          </If>
                        </CardFooter>
                      </Card>
                    ))}
                  </>
                }
              >
                <div className="text-muted-foreground flex size-full flex-col items-center justify-center text-center">
                  <Megaphone className="text-muted-foreground/70 mb-4 size-12" />
                  <h3 className="text-foreground text-lg font-semibold">
                    No announcements found
                  </h3>
                  <p className="text-muted-foreground max-w-sm text-sm">
                    Try searching with a different keyword.
                  </p>
                </div>
              </If>
            </>
          }
        >
          <div className="text-muted-foreground flex size-full flex-col items-center justify-center text-center">
            <Megaphone className="text-muted-foreground/70 mb-4 size-12" />
            <h3 className="text-foreground text-lg font-semibold">
              No announcements posted
            </h3>
            <p className="text-muted-foreground max-w-sm text-sm">
              Keep your students in the loop. Share important updates,
              reminders, or deadlines by creating your first announcement.
            </p>
          </div>
        </If>
      </div>

      {dialogConfig && (
        <ConfirmationDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title={dialogConfig.title}
          description={dialogConfig.description}
          onConfirm={() => {
            dialogConfig.onConfirm();
            setDialogOpen(false);
          }}
          confirmText={dialogConfig.confirmText}
          variant={dialogConfig.variant}
        />
      )}
    </>
  );
}
