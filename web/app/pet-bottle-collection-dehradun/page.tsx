import ServicePage from "@/components/ServicePage";
import { petPage, serviceMetadata } from "@/lib/services";

// Local landing page: PET bottle doorstep collection in Dehradun.
export const metadata = serviceMetadata(petPage);

export default function Page() {
  return <ServicePage d={petPage} />;
}
