import ServicePage from "@/components/ServicePage";
import { venuesPage, serviceMetadata } from "@/lib/services";

// Local landing page: can and PET bottle collection for bars, restaurants and cafes in Dehradun.
export const metadata = serviceMetadata(venuesPage);

export default function Page() {
  return <ServicePage d={venuesPage} />;
}
