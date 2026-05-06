"use client";

import { motion } from "framer-motion";
import { Upload } from "lucide-react";
import { useCallback, useEffect } from "react";
import type { Accept } from "react-dropzone";
import { useDropzone } from "react-dropzone";

import { Badge } from "@/components/ui/Badge";
import { cn } from "@/components/ui/cn";
import { validateResumeFile } from "@/lib/fileHelpers";

const accept: Accept = {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
};

export function UploadZone({
  onAccepted,
  onInvalid,
  disabled,
}: {
  onAccepted: (file: File) => void;
  onInvalid: (message: string) => void;
  disabled?: boolean;
}) {
  const onDrop = useCallback(
    (files: File[]) => {
      const file = files[0];
      if (!file) return;
      const err = validateResumeFile(file);
      if (err) {
        onInvalid(err);
        return;
      }
      onAccepted(file);
    },
    [onAccepted, onInvalid],
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept,
    maxFiles: 1,
    multiple: false,
    disabled,
    noClick: true,
    onDropAccepted: onDrop,
    onDropRejected: () => {
      onInvalid("Only PDF and DOCX files are supported.");
    },
  });

  useEffect(() => {
    if (disabled) return;
    const handleOpen = () => open();
    window.addEventListener('open-upload-dialog', handleOpen);
    return () => window.removeEventListener('open-upload-dialog', handleOpen);
  }, [open, disabled]);

  const rootProps = getRootProps();

  return (
    <motion.div
      className="w-full max-w-xl"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Dropzone bindings must stay on a native div (react-dropzone + framer-motion prop clash). */}
      <div
        {...rootProps}
        className={cn(
          "group relative rounded-3xl border-2 border-dashed p-10 transition-[transform,border-color,box-shadow] duration-300 ease-out will-change-transform",
          "border-white/10 bg-zinc-900/5 shadow-inner shadow-white/5 backdrop-blur-md",
          "hover:border-violet-500/50 hover:bg-zinc-900/10 hover:shadow-[0_0_30px_rgba(139,92,246,0.15)]",
          !disabled && !isDragActive && "hover:scale-[1.01]",
          disabled && "pointer-events-none opacity-65",
          isDragActive &&
            "scale-[1.02] border-violet-500/80 bg-violet-500/10 shadow-[0_0_0_5px_rgba(139,92,246,0.2)] ring-4 ring-violet-500/30",
        )}
      >
        <input {...getInputProps()} />
        <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-white/10 via-transparent to-violet-600/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <div className="relative flex flex-col items-center gap-3 text-center">
          <motion.div
            animate={
              isDragActive
                ? { scale: [1, 1.08, 1], rotate: [0, -3, 3, 0] }
                : { scale: 1, rotate: 0 }
            }
            transition={{ duration: 0.9, repeat: isDragActive ? Infinity : 0, ease: "easeInOut" }}
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 text-white shadow-lg shadow-black/50 ring-1 ring-white/10"
          >
            <Upload className="h-6 w-6 text-violet-400" aria-hidden />
          </motion.div>
          <div className="space-y-1">
            <p className="text-lg font-bold tracking-tight text-white">
              Drop your resume here
            </p>
            <p className="text-sm text-zinc-400">
              <span className="font-semibold text-zinc-300">or tap browse</span> — we&apos;ll handle
              the rest
            </p>
          </div>
          <div className="pt-1">
            <Badge className="border-violet-500/20 bg-violet-500/10 font-bold text-violet-200 shadow-sm backdrop-blur-sm">
              PDF or DOCX · Max 5MB
            </Badge>
          </div>
          <div className="pt-2">
            <button
              type="button"
              disabled={disabled}
              onClick={(e) => {
                e.stopPropagation();
                open();
              }}
              className="pointer-events-auto rounded-2xl bg-zinc-900 px-5 py-2.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(255,255,255,0.15)] ring-1 ring-white/20 transition-[transform,colors] duration-150 hover:scale-[1.04] active:scale-95 hover:bg-white hover:text-black disabled:pointer-events-none disabled:opacity-50"
            >
              Browse files
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
