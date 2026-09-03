import crypto from "node:crypto";
import { db } from "../../db/database.js";

export interface AuditEvent {
  event_id: string;
  actor_id: string;
  actor_role: string;
  action: string;
  target_type: string;
  target_id: string;
  timestamp: string;
  payload_digest: string;
  previous_hash: string;
  current_hash: string;
}

export class AuditService {
  public static logEvent(params: {
    actorId: string;
    actorRole: string;
    action: string;
    targetType: string;
    targetId: string;
    payload: any;
  }): AuditEvent {
    const timestamp = new Date().toISOString();
    const eventId = `EVT-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;
    
    // Canonical payload digest
    const canonicalPayload = JSON.stringify(params.payload, Object.keys(params.payload || {}).sort());
    const payloadDigest = crypto.createHash("sha256").update(canonicalPayload).digest("hex");

    // Fetch previous event's current_hash
    const lastRow = db.prepare("SELECT current_hash FROM audit_events ORDER BY rowid DESC LIMIT 1").get() as { current_hash: string } | undefined;
    const previousHash = lastRow?.current_hash || "0000000000000000000000000000000000000000000000000000000000000000";

    // Canonical string to hash
    const canonicalString = `${eventId}|${params.actorId}|${params.actorRole}|${params.action}|${params.targetType}|${params.targetId}|${timestamp}|${payloadDigest}|${previousHash}`;
    const currentHash = crypto.createHash("sha256").update(canonicalString).digest("hex");

    db.prepare(`
      INSERT INTO audit_events (
        event_id, actor_id, actor_role, action, target_type, target_id,
        timestamp, payload_digest, previous_hash, current_hash
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      eventId, params.actorId, params.actorRole, params.action, params.targetType, params.targetId,
      timestamp, payloadDigest, previousHash, currentHash
    );

    return {
      event_id: eventId,
      actor_id: params.actorId,
      actor_role: params.actorRole,
      action: params.action,
      target_type: params.targetType,
      target_id: params.targetId,
      timestamp,
      payload_digest: payloadDigest,
      previous_hash: previousHash,
      current_hash: currentHash
    };
  }

  public static getEvents(limit: number = 50): AuditEvent[] {
    return (db.prepare("SELECT * FROM audit_events ORDER BY rowid DESC LIMIT ?").all(limit) as unknown) as AuditEvent[];
  }

  public static verifyChain(): {
    is_valid: boolean;
    total_events: number;
    broken_event_id: string | null;
    broken_reason: string | null;
    verified_at: string;
  } {
    const events = (db.prepare("SELECT * FROM audit_events ORDER BY rowid ASC").all() as unknown) as AuditEvent[];
    if (events.length === 0) {
      return {
        is_valid: true,
        total_events: 0,
        broken_event_id: null,
        broken_reason: null,
        verified_at: new Date().toISOString()
      };
    }

    let expectedPrevHash = "0000000000000000000000000000000000000000000000000000000000000000";

    for (let i = 0; i < events.length; i++) {
      const e = events[i];
      if (i > 0 && e.previous_hash !== expectedPrevHash) {
        return {
          is_valid: false,
          total_events: events.length,
          broken_event_id: e.event_id,
          broken_reason: `Chain pointer broken at index ${i}. Expected previous_hash '${expectedPrevHash}', found '${e.previous_hash}'.`,
          verified_at: new Date().toISOString()
        };
      }

      const canonicalString = `${e.event_id}|${e.actor_id}|${e.actor_role}|${e.action}|${e.target_type}|${e.target_id}|${e.timestamp}|${e.payload_digest}|${e.previous_hash}`;
      const recomputedHash = crypto.createHash("sha256").update(canonicalString).digest("hex");

      if (recomputedHash !== e.current_hash) {
        return {
          is_valid: false,
          total_events: events.length,
          broken_event_id: e.event_id,
          broken_reason: `Payload tampering detected at event '${e.event_id}'. Recomputed hash '${recomputedHash}' does not match stored hash '${e.current_hash}'.`,
          verified_at: new Date().toISOString()
        };
      }

      expectedPrevHash = e.current_hash;
    }

    return {
      is_valid: true,
      total_events: events.length,
      broken_event_id: null,
      broken_reason: null,
      verified_at: new Date().toISOString()
    };
  }
}
