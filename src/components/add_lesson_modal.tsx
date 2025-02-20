import type { Dispatch, SetStateAction } from "react";

import { X } from "lucide-react";

import { Dialog, DialogContent } from "./ui/dialog";

interface AddLessonModalProps {
  text?: string;
  open: boolean;
  image?: string;
  type: "image" | "text";
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const AddLessonModal = ({
  text,
  type,
  open,
  image,
  setOpen,
}: AddLessonModalProps) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-sm p-0 md:max-w-md">
        <div className="relative w-full">
          <div
            onClick={() => setOpen(false)}
            className="absolute -right-3 -top-3 size-6 cursor-pointer rounded-md bg-primary p-1.5 text-white"
          >
            <X className="size-full" />
          </div>
          <div className="flex aspect-square max-h-full w-full flex-col items-start justify-start overflow-y-auto p-5">
            {type === "image" ? (
              <img
                src={image}
                alt="image-preview"
                className="aspect-square w-full object-cover"
              />
            ) : (
              <p className="w-full break-all text-justify font-semibold">
                {text}
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddLessonModal;
