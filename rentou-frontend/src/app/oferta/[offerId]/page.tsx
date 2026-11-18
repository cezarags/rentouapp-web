import type { Metadata } from "next";
import { Suspense } from "react";
import { OfferDetailsView } from "@/features/offer-details/offer-details-view";

export const metadata: Metadata = { title: "Detalhes da oferta" };

export default function OfferDetailsPage() {
  return (
    <div className="flex-1 bg-slate-50/60">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <Suspense>
          <OfferDetailsView />
        </Suspense>
      </div>
    </div>
  );
}
