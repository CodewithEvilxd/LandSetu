import { db } from "../../db/database.js";
import { LandParcel, ResolutionResult } from "./parcelTypes.js";

export interface ResolveParams {
  query?: string;
  khasra?: string;
  khata?: string;
  khatauni?: string;
  khewat?: string;
  owner_name?: string;
  state?: string;
  district?: string;
  tehsil?: string;
  village?: string;
  allow_fuzzy?: boolean;
}

export class ParcelResolver {
  public static resolve(params: ResolveParams): ResolutionResult {
    const rawQuery = (params.query || "").trim();
    const khasra = (params.khasra || "").trim();
    const khata = (params.khata || "").trim();
    const khewat = (params.khewat || "").trim();
    const ownerName = (params.owner_name || "").trim();
    const state = (params.state || "").trim();
    const village = (params.village || "").trim();

    // 1. Stage 1: Exact composite parcel_uid match
    if (rawQuery.includes("|")) {
      const exactUid = db.prepare("SELECT * FROM land_parcels WHERE parcel_uid = ?").get(rawQuery) as unknown as LandParcel | undefined;
      if (exactUid) {
        return {
          status: "resolved",
          match_type: "exact_composite",
          confidence: 1.0,
          candidate_count: 1,
          resolved_parcel: exactUid
        };
      }
    }

    // 2. Stage 2: Direct Khasra number match within state and/or village
    const targetKhasra = khasra || rawQuery;
    if (targetKhasra) {
      let sql = "SELECT * FROM land_parcels WHERE (native_identifier = ? OR native_identifier = ?)";
      const cleanTarget = targetKhasra.replace("/", "_");
      const queryParams: any[] = [targetKhasra, cleanTarget];

      if (state) {
        sql += " AND state = ? COLLATE NOCASE";
        queryParams.push(state);
      }
      if (village) {
        sql += " AND village = ? COLLATE NOCASE";
        queryParams.push(village);
      }

      const rows = db.prepare(sql).all(...queryParams) as unknown as LandParcel[];

      if (rows.length === 1) {
        return {
          status: "resolved",
          match_type: "exact_native",
          confidence: 0.98,
          candidate_count: 1,
          resolved_parcel: rows[0]
        };
      } else if (rows.length > 1) {
        return {
          status: "ambiguous",
          match_type: "exact_native",
          confidence: 0.70,
          candidate_count: rows.length,
          candidates: rows,
          ambiguity_reason: `Multiple parcels match Khasra '${targetKhasra}' across different villages or districts. Please specify Village or District to narrow down.`
        };
      }
    }

    // 3. Stage 3: Multi-Identifier search (via parcel_identifiers table)
    if (khata || khewat || params.khatauni) {
      let idType = khata ? "khata" : (khewat ? "khewat" : "khatauni");
      let idVal = khata || khewat || params.khatauni || "";

      let sql = `
        SELECT p.* FROM land_parcels p
        JOIN parcel_identifiers i ON p.parcel_uid = i.parcel_uid
        WHERE i.identifier_type = ? AND (i.identifier_value = ? OR i.normalized_value = ?)
      `;
      const idParams: any[] = [idType, idVal, idVal.replace(/[^a-zA-Z0-9]/g, "")];

      if (state) {
        sql += " AND p.state = ? COLLATE NOCASE";
        idParams.push(state);
      }
      if (village) {
        sql += " AND p.village = ? COLLATE NOCASE";
        idParams.push(village);
      }

      const matchedById = db.prepare(sql).all(...idParams) as unknown as LandParcel[];
      if (matchedById.length === 1) {
        return {
          status: "resolved",
          match_type: "normalized",
          confidence: 0.95,
          candidate_count: 1,
          resolved_parcel: matchedById[0]
        };
      } else if (matchedById.length > 1) {
        return {
          status: "ambiguous",
          match_type: "normalized",
          confidence: 0.65,
          candidate_count: matchedById.length,
          candidates: matchedById,
          ambiguity_reason: `Multiple parcels found under ${idType.toUpperCase()} '${idVal}'. A single khata/khewat often contains multiple Khasras.`
        };
      }
    }

    // 4. Stage 4: Owner name + geography lookup
    if (ownerName) {
      let sql = `
        SELECT DISTINCT p.* FROM land_parcels p
        JOIN parcel_rights r ON p.parcel_uid = r.parcel_uid
        WHERE r.rights_holder_name LIKE ? COLLATE NOCASE
      `;
      const ownerParams: any[] = [`%${ownerName}%`];

      if (state) {
        sql += " AND p.state = ? COLLATE NOCASE";
        ownerParams.push(state);
      }
      if (village) {
        sql += " AND p.village = ? COLLATE NOCASE";
        ownerParams.push(village);
      }

      const matchedByOwner = db.prepare(sql).all(...ownerParams) as unknown as LandParcel[];
      if (matchedByOwner.length === 1) {
        return {
          status: "resolved",
          match_type: "owner_geography",
          confidence: 0.90,
          candidate_count: 1,
          resolved_parcel: matchedByOwner[0]
        };
      } else if (matchedByOwner.length > 1) {
        return {
          status: "ambiguous",
          match_type: "owner_geography",
          confidence: 0.60,
          candidate_count: matchedByOwner.length,
          candidates: matchedByOwner,
          ambiguity_reason: `Recorded rights-holder '${ownerName}' holds rights across ${matchedByOwner.length} distinct parcels.`
        };
      }
    }

    // 5. Stage 5: Explicit fuzzy fallback (only if allow_fuzzy === true)
    if (params.allow_fuzzy && rawQuery.length >= 3) {
      const fuzzyRows = db.prepare(`
        SELECT * FROM land_parcels
        WHERE native_identifier LIKE ? OR village LIKE ? OR district LIKE ?
        LIMIT 5
      `).all(`%${rawQuery}%`, `%${rawQuery}%`, `%${rawQuery}%`) as unknown as LandParcel[];

      if (fuzzyRows.length === 1) {
        return {
          status: "resolved",
          match_type: "fuzzy",
          confidence: 0.50,
          candidate_count: 1,
          resolved_parcel: fuzzyRows[0]
        };
      } else if (fuzzyRows.length > 1) {
        return {
          status: "ambiguous",
          match_type: "fuzzy",
          confidence: 0.40,
          candidate_count: fuzzyRows.length,
          candidates: fuzzyRows,
          ambiguity_reason: `Fuzzy search returned ${fuzzyRows.length} potential candidates.`
        };
      }
    }

    return {
      status: "not_found",
      match_type: "none",
      confidence: 0.0,
      candidate_count: 0
    };
  }
}
