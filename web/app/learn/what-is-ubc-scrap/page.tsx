import GuidePage from "@/components/GuidePage";
import { guideMetadata, ubcGuide } from "@/lib/guides";

export const metadata = guideMetadata(ubcGuide);

export default function Page() {
  return <GuidePage d={ubcGuide} />;
}
