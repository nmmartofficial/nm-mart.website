import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { supabase } from "./client";

type SyncTable = "products" | "categories" | "subcategories" | "brands" | "banners";
type SyncPayload = RealtimePostgresChangesPayload<Record<string, unknown>> & { table: SyncTable };
type SyncListener = (payload: SyncPayload) => void;

const syncTables: SyncTable[] = ["products", "categories", "subcategories", "brands", "banners"];
const listeners = new Set<SyncListener>();
let channel: ReturnType<typeof supabase.channel> | null = null;

function ensureChannel() {
  if (channel || listeners.size === 0) return;

  channel = supabase.channel("nm-mart-catalog-sync");
  syncTables.forEach((table) => {
    channel = channel!.on(
      "postgres_changes",
      { event: "*", schema: "public", table },
      (payload) => {
        const event = { ...payload, table } as SyncPayload;
        listeners.forEach((listener) => listener(event));
      }
    );
  });
  channel.subscribe((status) => {
    if (import.meta.env.DEV) console.debug(`[Supabase realtime] catalog channel: ${status}`);
  });
}

export function subscribeToCatalogChanges(listener: SyncListener) {
  listeners.add(listener);
  ensureChannel();

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && channel) {
      void supabase.removeChannel(channel);
      channel = null;
    }
  };
}