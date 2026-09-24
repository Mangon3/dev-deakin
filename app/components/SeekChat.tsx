"use client";

import { useState } from "react";
import { createPortal } from "react-dom";

import SeekPanel from "./SeekPanel";

// Floating assistant, mounted once in the layout
export default function SeekChat() {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 px-4 py-2.5 text-sm font-semibold rounded-sm bg-accent text-accent-ink hover:bg-accent-hover cursor-pointer"
      >
        Ask Seek
      </button>
    );
  }

  // Portalled so it is never clipped by a scrolling container
  return createPortal(
    <div className="fixed bottom-5 right-5 z-40 w-[min(23rem,calc(100vw-2.5rem))] h-[min(32rem,calc(100vh-2.5rem))]">
      <SeekPanel endpoint="/api/seek" onClose={() => setOpen(false)} />
    </div>,
    document.body
  );
}
