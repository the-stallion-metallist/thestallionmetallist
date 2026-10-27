import GuidePage from "@/components/GuidePage";
import { guideMetadata, petGuide } from "@/lib/guides";

export const metadata = guideMetadata(petGuide);

export default function Page() {
  return <GuidePage d={petGuide} />;
}
