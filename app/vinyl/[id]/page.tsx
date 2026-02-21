import React from "react";
import { notFound } from "next/navigation";
import { getVinylById } from "../../../lib/firestoreVinyls";
import type { Vinyl } from "../../../types/vinyl";
import ProductPageClient from "../../../components/ui/ProductPageClient";

type Props = { params: { id: string } };

export default async function ProductPage({ params }: Props) {
  const resolvedParams = await params as { id?: string };
  const id = resolvedParams?.id;
  if (!id) return notFound();
  let vinyl: Vinyl | null = null;
  try {
    vinyl = await getVinylById(id);
  } catch (err) {
    // Server fetch may fail in some environments; delegate to client
    console.warn("Server-side fetch for vinyl failed, falling back to client fetch", err);
    vinyl = null;
  }

  return <ProductPageClient vinyl={vinyl} id={id} />;
}
