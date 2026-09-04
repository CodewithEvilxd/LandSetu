export interface LandParcel {
  parcel_uid: string;
  state: string;
  district: string;
  subdivision?: string;
  tehsil: string;
  village: string;
  native_identifier: string;
  identifier_type: string;
  account_identifier?: string;
  source_system: string;
  source_id: string;
  source_record_id?: string;
  source_document_id?: string;
  area: number;
  area_unit: string;
  area_raw?: string;
  land_use: string;
  geometry_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ParcelRights {
  id: string;
  parcel_uid: string;
  rights_holder_name: string;
  rights_type: string;
  share_fraction?: string;
  parentage_or_details?: string;
  source_record_date?: string;
  source_id: string;
  source_url?: string;
  verification_status: string;
  legal_disclaimer: string;
}

export interface ParcelEvent {
  event_id: string;
  parcel_uid: string;
  event_type: string;
  event_date: string;
  valid_from?: string;
  valid_to?: string;
  order_reference?: string;
  description: string;
  source_id: string;
  created_at: string;
}

export interface ParcelMutation {
  mutation_id: string;
  parcel_uid: string;
  mutation_number: string;
  mutation_date?: string;
  mutation_type: string;
  status: string;
  order_reference?: string;
  source_id: string;
}

export interface ParcelEncumbrance {
  encumbrance_id: string;
  parcel_uid: string;
  encumbrance_type: string;
  amount?: number;
  institution?: string;
  details?: string;
  source_id: string;
}

export interface ParcelGeometry {
  geometry_id: string;
  parcel_uid: string;
  geometry_type: string;
  geojson: any;
  centroid_lat: number;
  centroid_lng: number;
  bbox_json: number[]; // [minX, minY, maxX, maxY]
  source_crs: string;
  quality_flag: string;
  source_id: string;
}

export interface CoverageArea {
  coverage_id: string;
  state: string;
  district: string;
  tehsil: string;
  village: string;
  has_cadastral_geometry: boolean;
  has_land_records: boolean;
  parcel_count: number;
  status: "verified" | "partial" | "unsupported";
  source_id: string;
}

export interface ParcelEvidenceBundle {
  parcel_identity: {
    parcel_uid: string;
    state: string;
    district: string;
    subdivision?: string;
    tehsil: string;
    village: string;
    native_identifier: string;
    identifier_type: string;
  };
  recorded_rights_information: {
    recorded_holders: Array<{
      name: string;
      parentage?: string;
      share?: string;
      rights_type: string;
    }>;
    record_date?: string;
    source: string;
    legal_disclaimer: string;
  };
  account_information: {
    khata_number?: string;
    khatauni_number?: string;
    khewat_number?: string;
  };
  area_and_land_use: {
    area_metric: number;
    area_local?: string;
    land_classification: string;
  };
  temporal_lifecycle: ParcelEvent[];
  mutation_history: ParcelMutation[];
  encumbrances: ParcelEncumbrance[];
  cadastral_geometry: {
    available: boolean;
    geometry_type?: string;
    centroid?: [number, number];
    geojson?: any;
    bbox?: number[];
    source_crs?: string;
  };
  acquisition_links: any[];
  dispute_links: any[];
  data_quality: {
    completeness_score: number;
    source_freshness: string;
    cross_source_consistency: string;
    verification_status: string;
  };
  sources: Array<{
    source_id: string;
    source_name?: string;
    publisher?: string;
    source_url: string;
    retrieved_at: string;
    checksum_sha256: string;
  }>;
  limitations: string[];
  checksum_sha256?: string;
  source_id?: string;
  source_name?: string;
  source_url?: string;
  retrieval_mode?: string;
  retrieval_timestamp?: string;
  terms_note?: string;
  composite_id?: string;
  state?: string;
  district?: string;
  tehsil?: string;
  village?: string;
  khasra?: string;
  field_evidence?: Array<{
    evidence_id?: string;
    field_name: string;
    source_record: string;
    raw_value?: string;
    confidence: number;
    extraction_method: string;
    citation_reference: string;
  }>;
}

export interface ResolutionResult {
  status: "resolved" | "ambiguous" | "not_found";
  match_type: "exact_native" | "exact_composite" | "normalized" | "owner_geography" | "fuzzy" | "none";
  confidence: number;
  candidate_count: number;
  resolved_parcel?: LandParcel;
  candidates?: LandParcel[];
  ambiguity_reason?: string;
}
