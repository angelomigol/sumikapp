export interface AdminAlert {
  alert_type: string;
  alert_message: string;
  severity: "low" | "medium" | "high" | "critical";
  count: number;
  action_required: boolean;
}
