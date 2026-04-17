import { notFound } from "next/navigation";

import { ShareReadClient } from "@/components/share/share-read-client";
import { verifyShareSignature } from "@/lib/share-crypto";
import { loadShareRecord } from "@/lib/share-store";

export const dynamic = "force-dynamic";

type PageProps = {
  params: { id: string };
  searchParams: Record<string, string | string[] | undefined>;
};

export default async function SharePage({ params, searchParams }: PageProps) {
  const id = params.id;
  const eRaw = searchParams.e;
  const sigRaw = searchParams.sig;
  const eStr = Array.isArray(eRaw) ? eRaw[0] : eRaw;
  const sig = Array.isArray(sigRaw) ? sigRaw[0] : sigRaw;

  const exp = eStr ? Number(eStr) : NaN;
  if (!id || !sig || !Number.isFinite(exp)) notFound();
  if (!verifyShareSignature(id, exp, sig)) notFound();

  const record = await loadShareRecord(id);
  if (!record) notFound();

  return <ShareReadClient kind={record.kind} payload={record.payload} expiresAt={exp} />;
}
