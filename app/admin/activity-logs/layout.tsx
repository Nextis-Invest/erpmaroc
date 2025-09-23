import { requireAdmin } from "@/lib/utils/adminAuth";

export default async function ActivityLogsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This will redirect to login if not authenticated, or to unauthorized if not admin
  await requireAdmin();

  return <>{children}</>;
}