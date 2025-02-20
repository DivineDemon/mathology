import type { Dispatch, SetStateAction } from "react";

import { TriangleAlert, X } from "lucide-react";

import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

interface WarningModalProps {
  open: boolean;
  message: string;
  cta?: () => void;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const WarningModal = ({ cta, open, message, setOpen }: WarningModalProps) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-sm md:max-w-md">
        <div
          onClick={() => setOpen(false)}
          className="absolute -right-3 -top-3 size-6 cursor-pointer rounded-md bg-destructive p-1.5 text-white"
        >
          <X className="size-full" />
        </div>
        <DialogHeader>
          <DialogTitle>Warning</DialogTitle>
          <DialogDescription>
            Please ensure before proceeding.
          </DialogDescription>
        </DialogHeader>
        <div className="flex w-full flex-col items-center justify-center gap-5 py-10">
          <TriangleAlert className="size-14 text-destructive" />
          <p className="w-full text-center text-xl font-bold">
            Are you sure you want to&nbsp;{message}&nbsp;?
          </p>
        </div>
        <DialogFooter className="gap-2.5">
          <Button
            onClick={() => setOpen(false)}
            type="button"
            variant="outline"
            size="default"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (cta) {
                cta();
              }
              setOpen(false);
            }}
            type="submit"
            variant="destructive"
            size="default"
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WarningModal;
