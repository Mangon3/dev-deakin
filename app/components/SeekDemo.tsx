"use client";

import SeekPanel from "./SeekPanel";

// Inline demo panel, pointed at the endpoint that needs no API key
export default function SeekDemo() {
  return (
    <div className="h-[32rem] max-w-xl">
      <SeekPanel endpoint="/api/seek/demo" />
    </div>
  );
}
