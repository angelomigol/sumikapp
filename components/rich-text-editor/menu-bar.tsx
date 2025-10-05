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
            className={`hover:bg-accent hover:text-accent-foreground size-8 p-0 ${
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

export default function MenuBar({ editor }: { editor: Editor | null }) {
  if (!editor) {
    return null;
  }

  const editorState = useEditorState({
    editor,
    selector: (ctx) => {
      return {
        isBold: ctx.editor.isActive("bold") ?? false,
        canBold: ctx.editor.can().chain().toggleBold().run() ?? false,
        isItalic: ctx.editor.isActive("italic") ?? false,
        canItalic: ctx.editor.can().chain().toggleItalic().run() ?? false,
        isStrike: ctx.editor.isActive("strike") ?? false,
        canStrike: ctx.editor.can().chain().toggleStrike().run() ?? false,
        canClearMarks: ctx.editor.can().chain().unsetAllMarks().run() ?? false,
        isParagraph: ctx.editor.isActive("paragraph") ?? false,
        isHeading1: ctx.editor.isActive("heading", { level: 1 }) ?? false,
        isHeading2: ctx.editor.isActive("heading", { level: 2 }) ?? false,
        isHeading3: ctx.editor.isActive("heading", { level: 3 }) ?? false,
        isBulletList: ctx.editor.isActive("bulletList") ?? false,
        isOrderedList: ctx.editor.isActive("orderedList") ?? false,
        isCodeBlock: ctx.editor.isActive("codeBlock") ?? false,
        isBlockquote: ctx.editor.isActive("blockquote") ?? false,
        canUndo: ctx.editor.can().chain().undo().run() ?? false,
        canRedo: ctx.editor.can().chain().redo().run() ?? false,
        isHighlight: editor.isActive("highlight") ?? false,
      };
    },
  });

  return (
    <div className="border-border bg-muted/30 flex items-center gap-1 border-b px-2 py-1.5">
      {/* Text Formatting Group */}
      <div className="flex items-center gap-0.5">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editorState.canBold}
          isActive={editorState.isBold}
          icon={<Bold className="size-4" />}
          label="Bold"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editorState.canItalic}
          isActive={editorState.isItalic}
          icon={<Italic className="size-4" />}
          label="Italic"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editorState.canStrike}
          isActive={editorState.isStrike}
          icon={<Strikethrough className="size-4" />}
          label="Strikethrough"
        />
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Headings Group */}
      <div className="flex items-center gap-0.5">
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          isActive={editorState.isHeading1}
          icon={<Heading1 className="size-4" />}
          label="Heading 1"
        />
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          isActive={editorState.isHeading2}
          icon={<Heading2 className="size-4" />}
          label="Heading 2"
        />
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          isActive={editorState.isHeading3}
          icon={<Heading3 className="size-4" />}
          label="Heading 3"
        />
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Lists and Blocks Group */}
      <div className="flex items-center gap-0.5">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editorState.isBulletList}
          icon={<List className="size-4" />}
          label="Bullet List"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editorState.isOrderedList}
          icon={<ListOrdered className="size-4" />}
          label="Numbered List"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editorState.isBlockquote}
          icon={<Quote className="size-4" />}
          label="Quote"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          isActive={editorState.isHighlight}
          icon={<Highlighter className="size-4" />}
          label="Highlight"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          icon={<Minus className="size-4" />}
          label="Horizontal Rule"
        />
      </div>

      <Separator orientation="vertical" />

      {/* History Group */}
      <div className="flex items-center gap-0.5">
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editorState.canUndo}
          icon={<Undo className="size-4" />}
          label="Undo"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editorState.canRedo}
          icon={<Redo className="size-4" />}
          label="Redo"
        />
      </div>
    </div>
  );
}
