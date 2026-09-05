import { FocusDetailScreen } from "@/components/blueprint/focus-detail-screen";

type Props = { params: Promise<{ focusId: string }> };

export default async function FocusPage({ params }: Props) {
  const { focusId } = await params;
  return <FocusDetailScreen focusId={focusId} />;
}
