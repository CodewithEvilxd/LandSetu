import { ParcelQueries } from "./parcelQueries.js";
import { CoverageArea } from "./parcelTypes.js";

export class CoverageService {
  public static getCoverageSummary() {
    const areas = ParcelQueries.getAllCoverageAreas();
    const verifiedStates = Array.from(new Set(areas.map(a => a.state)));
    const totalParcels = areas.reduce((sum, a) => sum + a.parcel_count, 0);

    return {
      platform: "LandSetu Sovereign Land Governance Intelligence Platform",
      data_coverage_mode: "verified_slices_only",
      active_cadastral_states: verifiedStates,
      coverage_areas: areas,
      total_verified_parcels: totalParcels,
      unsupported_territories_notice: "Areas outside verified states (Delhi, Haryana, Bihar) display standard baseline national boundaries with no simulated or fake parcel polygons.",
      provenance_policy: "Every displayed polygon and Khasra label is grounded in officially acquired and hashed survey data."
    };
  }
}
