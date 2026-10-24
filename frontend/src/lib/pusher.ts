import Pusher from "pusher-js";
import * as React from "react";

const pusherKey = import.meta.env.VITE_PUSHER_KEY || "";
const pusherCluster = import.meta.env.VITE_PUSHER_CLUSTER || "ap1";

let pusherInstance: Pusher | null = null;

export function getPusherClient(): Pusher | null {
  if (!pusherKey) return null;
  if (!pusherInstance) {
    pusherInstance = new Pusher(pusherKey, {
      cluster: pusherCluster,
      authEndpoint: `${import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1"}/pusher/auth`,
    });
  }
  return pusherInstance;
}

/**
 * Hook untuk berlangganan update slot real-time per lapangan (PRD Bab 9)
 */
export function useFieldSlotSubscription(
  fieldId?: string,
  onSlotUpdated?: (data: any) => void
) {
  React.useEffect(() => {
    if (!fieldId) return;
    const pusher = getPusherClient();
    if (!pusher) return;

    const channelName = `field-${fieldId}`;
    const channel = pusher.subscribe(channelName);

    const handleUpdate = (data: any) => {
      console.log(`[Pusher] Real-time slot update for ${fieldId}:`, data);
      onSlotUpdated?.(data);
    };

    channel.bind("slot.updated", handleUpdate);

    return () => {
      channel.unbind("slot.updated", handleUpdate);
      pusher.unsubscribe(channelName);
    };
  }, [fieldId, onSlotUpdated]);
}
