import AdminCreatorDetail from "@/components/features/admin/AdminCreatorDetail";

export default async function AdminCreatorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const creatorId = Number(id);

  if (!Number.isFinite(creatorId) || creatorId <= 0) {
    return (
      <main className="grid min-h-svh place-items-center bg-background px-6 font-sans text-[15px] text-muted-foreground">
        Invalid creator id.
      </main>
    );
  }

  return <AdminCreatorDetail creatorId={creatorId} />;
}
