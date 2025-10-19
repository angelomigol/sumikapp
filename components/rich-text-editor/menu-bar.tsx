import React from "react";

import { useEditorState, type Editor } from "@tiptap/react";
import {
  Bold,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  Italic,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo,
  Strikethrough,
  Undo,
} from "lucide-react";

import { Separator } from "@/components/ui/separator";

import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

interface ToolbarButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isActive?: boolean;
  icon: React.ReactNode;
  label: string;
}

function ToolbarButton({
  onClick,
  disabled,
  isActive,
  icon,
  label,
}: ToolbarButtonProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant={"ghost"}
            size={"sm"}
            onClick={onClick}
            disabled={disabled}
            className={`hover:bg-accent hover:text-accent-foreground size-7 p-0 md:size-8 ${
              isActive ? "bg-secondary text-secondary-foreground" : ""
            }`}
          >
            {icon}
            <span className="sr-only">{label}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default function MenuBar({
  editor,
  disabled = false,
}: {
  editor: Editor | null;
  disabled?: boolean;
}) {
  const editorState = useEditorState({
    editor,
    selector: (ctx) => {
      if (!editor) {
        return {
          isBold: false,
          canBold: false,
          isItalic: false,
          canItalic: false,
          isStrike: false,
          canStrike: false,
          canClearMarks: false,
          isParagraph: false,
          isHeading1: false,
          isHeading2: false,
          isHeading3: false,
          isBulletList: false,
          isOrderedList: false,
          isCodeBlock: false,
          isBlockquote: false,
          canUndo: false,
          canRedo: false,
          isHighlight: false,
        };
      }

      return {
        isBold: ctx.editor?.isActive("bold") ?? false,
        canBold: ctx.editor?.can().chain().toggleBold().run() ?? false,
        isItalic: ctx.editor?.isActive("italic") ?? false,
        canItalic: ctx.editor?.can().chain().toggleItalic().run() ?? false,
        isStrike: ctx.editor?.isActive("strike") ?? false,
        canStrike: ctx.editor?.can().chain().toggleStrike().run() ?? false,
        canClearMarks: ctx.editor?.can().chain().unsetAllMarks().run() ?? false,
        isParagraph: ctx.editor?.isActive("paragraph") ?? false,
        isHeading1: ctx.editor?.isActive("heading", { level: 1 }) ?? false,
        isHeading2: ctx.editor?.isActive("heading", { level: 2 }) ?? false,
        isHeading3: ctx.editor?.isActive("heading", { level: 3 }) ?? false,
        isBulletList: ctx.editor?.isActive("bulletList") ?? false,
        isOrderedList: ctx.editor?.isActive("orderedList") ?? false,
        isCodeBlock: ctx.editor?.isActive("codeBlock") ?? false,
        isBlockquote: ctx.editor?.isActive("blockquote") ?? false,
        canUndo: ctx.editor?.can().chain().undo().run() ?? false,
        canRedo: ctx.editor?.can().chain().redo().run() ?? false,
        isHighlight: ctx.editor?.isActive("highlight") ?? false,
      };
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div
      className={`border-border bg-muted/30 flex flex-wrap items-center gap-0.5 border-b px-1.5 py-1.5 md:gap-1 md:px-2 ${disabled ? "pointer-events-none opacity-60" : ""}`}
    >
      {/* Text Formatting Group */}
      <div className="flex items-center gap-0.5">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editorState?.canBold || disabled}
          isActive={editorState?.isBold}
          icon={<Bold className="size-3.5 md:size-4" />}
          label="Bold"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editorState?.canItalic || disabled}
          isActive={editorState?.isItalic}
          icon={<Italic className="size-3.5 md:size-4" />}
          label="Italic"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editorState?.canStrike || disabled}
          isActive={editorState?.isStrike}
          icon={<Strikethrough className="size-3.5 md:size-4" />}
          label="Strikethrough"
        />
      </div>

      <Separator orientation="vertical" className="h-5 md:h-6" />

      {/* Headings Group - Hide H2 and H3 on mobile */}
      <div className="flex items-center gap-0.5">
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          disabled={disabled}
          isActive={editorState?.isHeading1}
          icon={<Heading1 className="size-3.5 md:size-4" />}
          label="Heading 1"
        />
        <span className="hidden sm:contents">
          <ToolbarButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            disabled={disabled}
            isActive={editorState?.isHeading2}
            icon={<Heading2 className="size-3.5 md:size-4" />}
            label="Heading 2"
          />
        </span>
        <span className="hidden md:contents">
          <ToolbarButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            disabled={disabled}
            isActive={editorState?.isHeading3}
            icon={<Heading3 className="size-3.5 md:size-4" />}
            label="Heading 3"
          />
        </span>
      </div>

      <Separator orientation="vertical" className="h-5 md:h-6" />

      {/* Lists and Blocks Group */}
      <div className="flex items-center gap-0.5">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          disabled={disabled}
          isActive={editorState?.isBulletList}
          icon={<List className="size-3.5 md:size-4" />}
          label="Bullet List"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          disabled={disabled}
          isActive={editorState?.isOrderedList}
          icon={<ListOrdered className="size-3.5 md:size-4" />}
          label="Numbered List"
        />
        <span className="hidden sm:contents">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            disabled={disabled}
            isActive={editorState?.isBlockquote}
            icon={<Quote className="size-3.5 md:size-4" />}
            label="Quote"
          />
        </span>
        <span className="hidden md:contents">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            disabled={disabled}
            isActive={editorState?.isHighlight}
            icon={<Highlighter className="size-3.5 md:size-4" />}
            label="Highlight"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            disabled={disabled}
            icon={<Minus className="size-3.5 md:size-4" />}
            label="Horizontal Rule"
          />
        </span>
      </div>

      <Separator orientation="vertical" className="h-5 md:h-6" />

      {/* History Group */}
      <div className="flex items-center gap-0.5">
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editorState?.canUndo || disabled}
          icon={<Undo className="size-3.5 md:size-4" />}
          label="Undo"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editorState?.canRedo || disabled}
          icon={<Redo className="size-3.5 md:size-4" />}
          label="Redo"
        />
      </div>
    </div>
  );
}
