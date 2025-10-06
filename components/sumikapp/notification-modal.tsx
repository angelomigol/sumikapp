import React from "react";

import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

export default function NotificationsModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size={"sm"}></Button>
      </DialogTrigger>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className="max-h-[90%] sm:max-w-md"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Notifications
          </DialogTitle>
          {/* <DialogDescription>
            You have {unreadCount} unread notification
            {unreadCount !== 1 ? "s" : ""}.
          </DialogDescription> */}
        </DialogHeader>
        {/* <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            <Check className="mr-2 h-4 w-4" />
            Mark all as read
          </Button>
        </div>
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-4 pr-4">
            {notifs.length > 0 ? (
              notifs.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "group relative rounded-lg border p-4 transition-colors",
                    notification.is_read ? "bg-background" : "bg-muted/50"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full",
                        notificationMeta[notification.type]?.style ??
                          "bg-gray-100 text-gray-600"
                      )}
                    >
                      {notificationMeta[notification.type]?.icon ?? (
                        <Settings className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{notification.title}</h4>
                        <span className="text-muted-foreground text-xs group-hover:hidden">
                          {notification.created_at}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {notification.message}
                      </p>
                    </div>
                  </div>
                  <div className="invisible absolute top-4 right-4 flex gap-1 opacity-0 transition-opacity group-hover:visible group-hover:opacity-100">
                    {!notification.is_read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <Check className="h-4 w-4" />
                        <span className="sr-only">Mark as read</span>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => dismissNotification(notification.id)}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Dismiss</span>
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Bell className="text-muted-foreground mb-2 h-10 w-10" />
                <h3 className="mb-1 text-lg font-medium">No notifications</h3>
                <p className="text-muted-foreground text-sm">
                  You're all caught up! No new notifications.
                </p>
              </div>
            )}
          </div>
        </ScrollArea> */}
      </DialogContent>
    </Dialog>
  );
}
