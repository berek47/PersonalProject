"use client";

import { Button } from "@/components/ui/button";
import { DownloadIcon, ShareIcon } from "lucide-react";

interface CertificateActionsProps {
  courseTitle: string;
}

export function CertificateActions({ courseTitle }: CertificateActionsProps) {
  function handlePrint() {
    window.print();
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: "My Certificate",
        text: `I completed ${courseTitle}!`,
        url: window.location.href,
      });
    }
  }

  return (
    <>
      <div className="mt-6 flex justify-center gap-4 print:hidden">
        <Button variant="outline" onClick={handlePrint}>
          <DownloadIcon className="mr-2 size-4" />
          Print Certificate
        </Button>
        <Button variant="outline" onClick={handleShare}>
          <ShareIcon className="mr-2 size-4" />
          Share
        </Button>
      </div>

      <style>{`
        @media print {
          header, nav, aside {
            display: none !important;
          }
          main {
            padding: 0 !important;
          }
        }
      `}</style>
    </>
  );
}
