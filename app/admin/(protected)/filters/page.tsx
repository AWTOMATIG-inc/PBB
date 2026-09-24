import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSessionToken } from "@/lib/session";
import {
  brandLogoUrl,
  getOptionUsage,
  listBrands,
  listOptions,
  listPowerBands,
} from "@/lib/products";
import BrandsManager from "@/components/admin/brands-manager";
import PowerBandsManager from "@/components/admin/power-bands-manager";
import OptionListManager from "@/components/admin/option-list-manager";

export const metadata: Metadata = {
  title: "Filters | Admin | Power Bank Bangladesh",
};

export default async function AdminFiltersPage() {
  const token = await getAdminSessionToken();
  if (!token) redirect("/admin/login");

  const [brands, powerBands, alternatorMakes, controllers, usage] = await Promise.all([
    listBrands(token),
    listPowerBands(token),
    listOptions(token, "alternator_makes"),
    listOptions(token, "controllers"),
    getOptionUsage(token),
  ]);
  const brandLogoUrls = Object.fromEntries(brands.map((brand) => [brand.id, brandLogoUrl(brand)]));

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Filters</h1>
        <p className="mt-1 text-sm text-ink-500">
          Manage the brands, power bands, alternator makes and controllers used across the
          Products page filters.
        </p>
      </div>

      <BrandsManager brands={brands} logoUrls={brandLogoUrls} />
      <PowerBandsManager powerBands={powerBands} />
      <OptionListManager
        list="alternator_makes"
        title="Alternator makes"
        noun="alternator make"
        placeholder="e.g. Stamford"
        options={alternatorMakes}
        usage={usage.alternator_makes}
      />
      <OptionListManager
        list="controllers"
        title="Controllers"
        noun="controller"
        placeholder="e.g. Deep Sea Electronics"
        options={controllers}
        usage={usage.controllers}
      />
    </div>
  );
}
