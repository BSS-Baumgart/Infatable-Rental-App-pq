import AttractionDetailPageClient from "./client";

export default function Page({ params }: { params: { id: string } }) {
  return <AttractionDetailPageClient id={params.id} />;
}
