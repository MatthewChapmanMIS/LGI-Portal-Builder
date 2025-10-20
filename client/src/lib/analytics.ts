import { apiRequest } from "./queryClient";

interface TrackEventParams {
  eventType: "view" | "click";
  resourceType: "subsite" | "link";
  resourceId: string;
}

export async function trackEvent(params: TrackEventParams) {
  try {
    await apiRequest("/api/analytics/track", {
      method: "POST",
      body: JSON.stringify(params),
    });
  } catch (error) {
    console.error("Failed to track event:", error);
  }
}
