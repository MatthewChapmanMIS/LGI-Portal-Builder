import { apiRequest } from "./queryClient";

interface TrackEventParams {
  eventType: "view" | "click";
  resourceType: "subsite" | "link";
  resourceId: string;
}

export async function trackEvent(params: TrackEventParams) {
  try {
    await apiRequest("POST", "/api/analytics/track", params);
  } catch (error) {
    console.error("Failed to track event:", error);
  }
}
