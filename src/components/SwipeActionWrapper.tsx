import { motion, useAnimation } from "framer-motion";
import { Trash2 } from "lucide-react";
import React, { useRef } from "react";
import { Button } from "./ui/button";

interface SwipeActionWrapperProps {
  children: React.ReactNode;
  index: string;
  onRemove: (newsId: string) => Promise<void>;
}

export default function SwipeActionWrapper({
  children,
  index,
  onRemove,
}: SwipeActionWrapperProps) {
  const controls = useAnimation();
  const constraintsRef = useRef(null);

  const ACTION_WIDTH = 80;

  return (
    <div
      ref={constraintsRef}
      className="group relative mb-2 h-25 overflow-hidden rounded-base shadow-[0_4px_8px] shadow-primary/10"
    >
      {/* layer-0 - delete button */}
      <div className="absolute inset-y-0 right-0 flex w-20">
        <Button
          className="flex h-full flex-1 cursor-pointer flex-col items-center justify-center bg-destructive text-text-dark hover:bg-destructive/70"
          onClick={async () => {
            await onRemove(index);
            controls.start({ x: 0 }); // 移除成功後回彈
          }}
        >
          <Trash2 size={20} />
          <span className="text-[12px]">Delete</span>
        </Button>

        {/* <Dialog>
          <DialogTrigger asChild></DialogTrigger>
          <DialogContent showCloseButton={false}>
            <DialogHeader>
              <DialogTitle className="text-[24px]">
                Confirm removal from your favorite list?
              </DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently remove this
                news from your favorite list.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <div className="flex justify-between">
                <DialogClose asChild>
                  <Button variant="outline" className="w-[45%] rounded-full">
                    Cancel
                  </Button>
                </DialogClose>
                <LoadingButton
                  variant="destructive"
                  className="w-[45%] rounded-full"
                  onClick={async () => {
                    await onRemove(index);
                    controls.start({ x: 0 }); // 移除成功後回彈
                  }}
                >
                  Sure
                </LoadingButton>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog> */}
      </div>

      {/* layer-1 - NewsItem */}
      <motion.div
        drag="x" // 僅限水平拖拽
        dragConstraints={{ left: -ACTION_WIDTH, right: 0 }} // 限制拖動範圍
        dragElastic={0.1} // 拖過頭時的彈性
        dragSnapToOrigin={false} // 不要立刻回彈到 0
        dragMomentum={false} // 關掉放開時的慣性
        animate={controls}
        onDragEnd={(_, info) => {
          // 如果滑過一半，就停留在開啟狀態，否則彈回原位
          if (info.offset.x < -ACTION_WIDTH / 2) {
            controls.start({ x: -ACTION_WIDTH });
          } else {
            controls.start({ x: 0 });
          }
        }}
        className="relative z-10 bg-popup-bg bg-newsItem-gradient dark:bg-popup-bg-dark dark:bg-newsItem-gradient-dark"
      >
        {children}
      </motion.div>
    </div>
  );
}
