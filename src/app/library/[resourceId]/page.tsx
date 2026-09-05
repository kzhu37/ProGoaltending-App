import { ResourceDetailScreen } from "@/components/library/resource-detail-screen";

type Props = { params: Promise<{ resourceId: string }> };

export default async function ResourcePage({ params }: Props) {
  const { resourceId } = await params;
  return <ResourceDetailScreen resourceId={resourceId} />;
}
