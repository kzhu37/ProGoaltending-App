import { SessionDetailScreen } from "@/components/training/session-detail-screen";

type Props = { params: Promise<{ sessionId: string }> };

export default async function SessionDetailPage({ params }: Props) {
  const { sessionId } = await params;
  return <SessionDetailScreen sessionId={sessionId} />;
}
