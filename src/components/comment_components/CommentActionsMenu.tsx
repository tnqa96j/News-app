/* UI */
import {
  Trash2Icon,
  PencilIcon,
  FlagIcon,
  EllipsisVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import LoadingButton from "../LoadingButton";
/* hooks & utils */
import { useState, type SetStateAction, type Dispatch } from "react";
import { useDialog } from "@/contexts/DialogContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogDescription,
  DialogTitle,
} from "../ui/dialog";
import { useLoading } from "@/contexts/LoadingContext";

interface CommentActionsMenuProps {
  isOwner: boolean; // 確認是否為留言本人
  onEdit: () => void;
  onDelete: () => Promise<void>;
  onReport: (reason: string) => Promise<void>;
}

const REPORT_OPTIONS = [
  "Spam",
  "Harassment",
  "Hate Speech",
  "Inappropriate content",
  "Misinformation",
] as const;

// type ReportReason = (typeof REPORT_OPTIONS)[number];

const ReportDialog = ({
  open,
  setOpen,
  onReport,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  onReport: (reason: string) => Promise<void>;
}) => {
  const [reportReason, setReportReason] = useState<string>("");
  const { isLoading, stopLoading } = useLoading();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        showCloseButton={false}
        onPointerDownOutside={(e) => isLoading && e.preventDefault()}
        onEscapeKeyDown={(e) => isLoading && e.preventDefault()}
        onInteractOutside={(e) => isLoading && e.preventDefault()}
        onAnimationEnd={(e) => {
          if (!open && e.target === e.currentTarget) {
            stopLoading();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-[24px] lg:text-[28px]">
            Report this comment
          </DialogTitle>
          <DialogDescription>
            Help us understand what's happening.
          </DialogDescription>
        </DialogHeader>
        {/* content */}
        <RadioGroup
          className="gap-6 py-5"
          value={reportReason}
          onValueChange={setReportReason}
        >
          {REPORT_OPTIONS.map((opt, index) => (
            <div key={index} className="flex items-center gap-4">
              <RadioGroupItem value={opt} id={opt} />
              <Label htmlFor={opt} className="text-[20px]">
                {opt}
              </Label>
            </div>
          ))}
        </RadioGroup>
        <DialogFooter>
          <div className="flex justify-between">
            {/* Cancel Button */}
            <Button
              variant="outline"
              className="w-[47.5%] rounded-full"
              disabled={isLoading}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>

            {/* Confirm Button */}
            <LoadingButton
              variant="destructive"
              className="w-[47.5%] rounded-full"
              onClick={async () => {
                if (reportReason) await onReport(reportReason);
                setOpen(false);
              }}
              disabled={!reportReason}
            >
              Report
            </LoadingButton>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default function CommentActionsMenu({
  isOwner,
  onEdit,
  onDelete,
  onReport,
}: CommentActionsMenuProps) {
  /* LocalState */
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const { openDialog } = useDialog();

  /* Event Handler */
  const handleDeleteClick = () => {
    openDialog({
      title: "Delete comment",
      description: "Delete your comment permanently?",
      confirmText: "Delete",
      confirmVariant: "destructive",
      onConfirm: onDelete,
    });
  };

  const handleReportClick = () => {
    setDialogOpen(true);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="cursor-pointer rounded-full hover:bg-primary/30 active:bg-primary/10">
            <EllipsisVertical className="size-6 shrink-0 md:size-10" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-40 md:w-50">
          {isOwner ? (
            <>
              <DropdownMenuItem
                className="cursor-pointer gap-4 p-4 text-[16px] md:text-[20px]"
                onClick={onEdit}
              >
                <PencilIcon className="size-6" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer gap-4 p-4 text-[16px] md:text-[20px]"
                onClick={handleDeleteClick}
                variant="destructive"
              >
                <Trash2Icon className="size-6" /> Delete
              </DropdownMenuItem>
            </>
          ) : (
            <DropdownMenuItem
              className="cursor-pointer gap-4 p-4 text-[16px] md:text-[20px]"
              onClick={handleReportClick}
            >
              <FlagIcon className="size-6" /> Report
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* only for report dialog */}
      <ReportDialog
        open={dialogOpen}
        setOpen={setDialogOpen}
        onReport={onReport}
      />
    </>
  );
}

/* DialogProvider 需要支援 children 插槽才能放 RadioGroup
      如果不支援，report 保留自己的 Dialog
      <RadioGroup
              className="gap-6 py-5"
              value={reportReason}
              onValueChange={setReportReason}
            >
              {REPORT_OPTIONS.map((opt, index) => (
                <div key={index} className="flex items-center gap-4">
                  <RadioGroupItem value={opt} id={opt} />
                  <Label htmlFor={opt} className="text-[20px]">
                    {opt}
                  </Label>
                </div>
              ))}
      </RadioGroup>
      關於 confirm按鈕的禁用 
      disabled={
        !reportReason && activeAction?.actionName === "report"
      }
      這邊要怎麼寫？  
      */
// 問題：第一次開啟時選擇選項沒有選中，反而是關掉dialog之後再開啟才會顯示選中的選項 => 閉包？
