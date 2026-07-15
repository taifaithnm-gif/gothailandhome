import { LoadingState } from "@/components/ui/states";
import { PageShell } from "@/components/layout/page-shell";

export default function PropertiesLoading() {
  return (
    <PageShell title="…" subtitle="">
      <LoadingState label="Loading listings…" />
    </PageShell>
  );
}
