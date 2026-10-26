import ServicePage from "@/components/ServicePage";
import { cansPage, serviceMetadata } from "@/lib/services";

// Local landing page: aluminium can (UBC) doorstep collection in Dehradun.
// The words live in lib/services.ts; the layout lives in components/ServicePage.tsx.
export const metadata = serviceMetadata(cansPage);

export default function Page() {
  return <ServicePage d={cansPage} />;
}
