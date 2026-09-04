import { db } from "../../db/database.js";
import { LandParcel, ParcelGeometry, ParcelRights, ParcelEvent, ParcelMutation, ParcelEncumbrance, CoverageArea } from "./parcelTypes.js";

export class ParcelQueries {
  public static getParcelByUid(parcelUid: string): LandParcel | null {
    const row = db.prepare("SELECT * FROM land_parcels WHERE parcel_uid = ?").get(parcelUid) as any;
    return row ? (row as LandParcel) : null;
  }

  public static getParcelsByVillage(state: string, village: string): LandParcel[] {
    return db.prepare("SELECT * FROM land_parcels WHERE state = ? COLLATE NOCASE AND village = ? COLLATE NOCASE ORDER BY native_identifier ASC")
      .all(state, village) as any[];
  }

  public static getGeometryByParcelUid(parcelUid: string): ParcelGeometry | null {
    const row = db.prepare("SELECT * FROM parcel_geometries WHERE parcel_uid = ?").get(parcelUid) as any;
    if (!row) return null;
    return {
      ...row,
      geojson: JSON.parse(row.geojson || "{}"),
      bbox_json: JSON.parse(row.bbox_json || "[]")
    };
  }

  public static getRightsByParcelUid(parcelUid: string): ParcelRights[] {
    return db.prepare("SELECT * FROM parcel_rights WHERE parcel_uid = ?").all(parcelUid) as any[];
  }

  public static getEventsByParcelUid(parcelUid: string): ParcelEvent[] {
    return db.prepare("SELECT * FROM parcel_events WHERE parcel_uid = ? ORDER BY event_date ASC").all(parcelUid) as any[];
  }

  public static getMutationsByParcelUid(parcelUid: string): ParcelMutation[] {
    return db.prepare("SELECT * FROM parcel_mutations WHERE parcel_uid = ? ORDER BY mutation_date DESC").all(parcelUid) as any[];
  }

  public static getEncumbrancesByParcelUid(parcelUid: string): ParcelEncumbrance[] {
    return db.prepare("SELECT * FROM parcel_encumbrances WHERE parcel_uid = ?").all(parcelUid) as any[];
  }

  public static getAccountsByParcelUid(parcelUid: string): any {
    return db.prepare("SELECT * FROM parcel_accounts WHERE parcel_uid = ?").get(parcelUid) || null;
  }

  public static getAcquisitionsByParcelUid(parcelUid: string): any[] {
    return db.prepare(`
      SELECT l.*, a.project_name, a.implementing_agency, a.current_status as project_status, a.disbursement_pct
      FROM parcel_acquisition_links l
      LEFT JOIN acquisition_projects a ON l.project_id = a.project_id
      WHERE l.parcel_uid = ?
    `).all(parcelUid) as any[];
  }

  public static getDisputesByParcelUid(parcelUid: string): any[] {
    return db.prepare("SELECT * FROM parcel_dispute_links WHERE parcel_uid = ?").all(parcelUid) as any[];
  }

  public static getEvidenceByParcelUid(parcelUid: string): any[] {
    return db.prepare("SELECT * FROM parcel_evidence WHERE parcel_uid = ?").all(parcelUid) as any[];
  }

  public static getCadastralMapByVillage(state: string, village: string): any | null {
    const row = db.prepare("SELECT * FROM cadastral_maps WHERE state = ? COLLATE NOCASE AND village = ? COLLATE NOCASE ORDER BY feature_count DESC LIMIT 1")
      .get(state, village) as any;
    if (!row) return null;
    return {
      ...row,
      cadastral_layer_json: JSON.parse(row.cadastral_layer_json || "{}")
    };
  }

  public static getAllCoverageAreas(): CoverageArea[] {
    const rows = db.prepare("SELECT * FROM coverage_areas ORDER BY state ASC, village ASC").all() as any[];
    return rows.map(r => ({
      ...r,
      has_cadastral_geometry: Boolean(r.has_cadastral_geometry),
      has_land_records: Boolean(r.has_land_records)
    }));
  }

  public static runResearchQuery(filters: { state?: string; district?: string; village?: string }) {
    let sql = `
      SELECT p.state, p.district, p.tehsil, p.village,
             COUNT(p.parcel_uid) as total_parcels,
             SUM(p.area) as total_area_hectares,
             AVG(p.area) as avg_parcel_size_hectares,
             COUNT(DISTINCT m.mutation_id) as total_mutations,
             COUNT(DISTINCT a.link_id) as total_acquisitions
      FROM land_parcels p
      LEFT JOIN parcel_mutations m ON p.parcel_uid = m.parcel_uid
      LEFT JOIN parcel_acquisition_links a ON p.parcel_uid = a.parcel_uid
      WHERE 1=1
    `;
    const params: any[] = [];
    if (filters.state) {
      sql += " AND p.state = ? COLLATE NOCASE";
      params.push(filters.state);
    }
    if (filters.district) {
      sql += " AND p.district = ? COLLATE NOCASE";
      params.push(filters.district);
    }
    if (filters.village) {
      sql += " AND p.village = ? COLLATE NOCASE";
      params.push(filters.village);
    }
    sql += " GROUP BY p.state, p.district, p.tehsil, p.village";

    return db.prepare(sql).all(...params);
  }

  public static getVillageKhatauni(state: string, village: string): any {
    const parcels = db.prepare(`
      SELECT p.*, a.khata_number, a.khatauni_number, a.khewat_number
      FROM land_parcels p
      LEFT JOIN parcel_accounts a ON p.parcel_uid = a.parcel_uid
      WHERE p.state = ? COLLATE NOCASE AND p.village = ? COLLATE NOCASE
      ORDER BY COALESCE(a.khata_number, '0000'), p.native_identifier ASC
    `).all(state, village) as any[];

    if (parcels.length === 0) return null;

    const khataMap = new Map<string, any>();

    for (const p of parcels) {
      const khataNum = p.khata_number || "0001";
      if (!khataMap.has(khataNum)) {
        khataMap.set(khataNum, {
          khata_number: khataNum,
          khatauni_number: p.khatauni_number || khataNum,
          tenure_category: p.land_use,
          state: p.state,
          district: p.district,
          tehsil: p.tehsil,
          village: p.village,
          fasli_year: "1430-1435 Fasli (2023-2028)",
          total_area_ha: 0,
          parcels: [],
          owners: [],
          mutations: []
        });
      }

      const khata = khataMap.get(khataNum);
      khata.total_area_ha = Number((khata.total_area_ha + (p.area || 0)).toFixed(4));
      khata.parcels.push({
        parcel_uid: p.parcel_uid,
        native_identifier: p.native_identifier,
        area_ha: p.area,
        area_raw: p.area_raw,
        land_use: p.land_use
      });

      const rights = db.prepare("SELECT * FROM parcel_rights WHERE parcel_uid = ?").all(p.parcel_uid) as any[];
      for (const r of rights) {
        if (!khata.owners.some((o: any) => o.rights_holder_name === r.rights_holder_name)) {
          khata.owners.push({
            rights_holder_name: r.rights_holder_name,
            parentage: r.parentage_or_details,
            share: r.share_fraction,
            rights_type: r.rights_type
          });
        }
      }

      const mutations = db.prepare("SELECT * FROM parcel_mutations WHERE parcel_uid = ?").all(p.parcel_uid) as any[];
      for (const m of mutations) {
        if (!khata.mutations.some((mut: any) => mut.mutation_number === m.mutation_number)) {
          khata.mutations.push({
            mutation_number: m.mutation_number,
            mutation_date: m.mutation_date,
            mutation_type: m.mutation_type,
            status: m.status,
            authority: m.order_reference
          });
        }
      }
    }

    return {
      state: parcels[0].state,
      district: parcels[0].district,
      tehsil: parcels[0].tehsil,
      village: parcels[0].village,
      fasli_year: "1430-1435 Fasli (2023-2028)",
      total_khatas: khataMap.size,
      total_parcels: parcels.length,
      khatas: Array.from(khataMap.values())
    };
  }
}
