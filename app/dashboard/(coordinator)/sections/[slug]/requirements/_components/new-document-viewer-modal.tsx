import React from "react";

import {
  CheckCircle,
  ChevronLeft,
  DownloadIcon,
  Info,
  RotateCwIcon,
  ShieldCheckIcon,
  ShieldXIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from "lucide-react";

import { getDocumentStatusConfig } from "@/lib/constants";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { If } from "@/components/sumikapp/if";

export default function NewDocumentViewerModal({
  isOpen,
}: {
  isOpen: boolean;
}) {
  return (
    <Dialog open={isOpen}>
      <DialogContent
        className="data-[state=open]:!zoom-in-0 flex h-screen min-w-screen flex-col gap-0 rounded-none bg-transparent p-0 outline-none data-[state=open]:duration-600"
        showCloseButton={false}
      >
        <DialogHeader className="bg-background flex-row justify-between border-b p-2">
          <div className="flex h-full items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size={"icon-sm"}
                  variant={"ghost"}
                  onClick={() => {}}
                  aria-label="Close"
                >
                  <ChevronLeft />
                  <span className="sr-only">Close</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Close</p>
              </TooltipContent>
            </Tooltip>

            <DialogTitle className="block max-w-2xs truncate"></DialogTitle>
            {/* <Badge
              className={getDocumentStatusConfig(currentStatus).badgeColor}
            >
              {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
            </Badge> */}
          </div>

          {/* {(isPdf || isImage) && ( */}
          <div className="flex items-center gap-4">
            <ButtonGroup>
              <ButtonGroup>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={"outline"}
                      size={"icon-sm"}
                      onClick={() => {}}
                      aria-label="Zoom Out"
                    >
                      <ZoomOutIcon />
                      <span className="sr-only">Zoom Out</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Zoom Out</TooltipContent>
                </Tooltip>

                <span className="bg-background dark:border-input dark:bg-input/30 flex items-center border px-3 text-sm font-medium">
                  {/* {`${zoom}%`} */}
                  0%
                </span>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={"outline"}
                      size={"icon-sm"}
                      onClick={() => {}}
                      aria-label="Zoom In"
                    >
                      <ZoomInIcon />
                      <span className="sr-only">Zoom In</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Zoom In</TooltipContent>
                </Tooltip>
              </ButtonGroup>

              <ButtonGroup>
                {/* <If condition={isImage}> */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={"outline"}
                      size={"icon-sm"}
                      onClick={() => {}}
                      aria-label="Rotate"
                    >
                      <RotateCwIcon className="size-4" />
                      <span className="sr-only">Rotate</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Rotate</TooltipContent>
                </Tooltip>
                {/* </If> */}

                <Button
                  variant={"outline"}
                  size={"sm"}
                  onClick={() => {}}
                  aria-label="Reset"
                >
                  Reset
                </Button>
              </ButtonGroup>
            </ButtonGroup>
          </div>
          {/* )} */}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={"ghost"}
                size={"icon-sm"}
                onClick={() => {}}
                aria-label="Download"
                // disabled={loadingState === "loading"}
              >
                {/* {loadingState !== "loading" && <DownloadIcon className="size-4" />} */}
                <DownloadIcon className="size-4" />
                <span className="sr-only">Download</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Download</TooltipContent>
          </Tooltip>
        </DialogHeader>
        <div className="grid min-h-0 flex-1 grid-cols-[22rem_1fr] overflow-hidden">
          <aside className="bg-background flex flex-col space-y-4 overflow-y-auto border-l p-4">
            
          </aside>
          <div className="relative h-full w-full bg-black/20"></div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// <aside className="bg-background flex flex-col space-y-4 overflow-y-auto border-l p-4">
//   <div className="flex items-center gap-2">
//     <Info className="size-4" />
//     <p className="font-semibold">Information</p>
//   </div>
//   <ul className="flex flex-1 flex-col gap-2 text-sm">
//     <li>
//       <span className="font-medium">Name:</span>
//     </li>
//     <li>
//       <span className="font-medium">Size:</span>
//     </li>
//     <li>
//       <span className="font-medium">Type:</span>
//     </li>
//     <li>
//       <span className="font-medium">Submitted Date:</span>
//     </li>
//     <li>
//       <span className="font-medium">Submitted By:</span>
//     </li>
//   </ul>

//   <div className="flex flex-col gap-4">
//     <Button
//       className="bg-green-600/10 text-green-600 hover:bg-green-600/20 focus-visible:ring-green-600/20 dark:bg-green-400/10 dark:text-green-400 dark:hover:bg-green-400/20 dark:focus-visible:ring-green-400/40"
//       //   onClick={handleApproveDocument}
//       //   disabled={loadingState !== "idle"}
//     >
//       Approve
//       <ShieldCheckIcon className="size-4" />
//     </Button>
//     <Button
//       //   onClick={() => setShowFeedbackForm(true)}
//       //   disabled={loadingState !== "idle"}
//       className="bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40'"
//     >
//       Reject
//       <ShieldXIcon className="size-4" />
//     </Button>
//   </div>
// </aside>;
