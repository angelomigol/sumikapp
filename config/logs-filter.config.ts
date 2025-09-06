import { LogsFilterConfigSchema } from "@/schemas/config/logs-filter-config.schema";

export const logsFilterConfig = LogsFilterConfigSchema.parse({
  filters: [
    {
      key: "timeline",
      label: "Timeline",
      type: "date",
      defaultValue: "custom",
      options: [
        { label: "Past 30 minutes", value: "past-half-hour" },
        { label: "Maximum (1 hour)", value: "past-hour" },
        { label: "Custom", value: "custom" },
      ],
    },
    {
      key: "logLevel",
      label: "Contains Level",
      type: "checkbox",
      defaultValue: "",
      options: [
        { label: "Debug", value: "debug" },
        { label: "Info", value: "info" },
        { label: "Warning", value: "warn" },
        { label: "Error", value: "error" },
        { label: "Fatal", value: "fatal" },
      ],
    },
    {
      key: "environment",
      label: "Environment",
      type: "checkbox",
      defaultValue: "",
      options: [
        { label: "Development", value: "development" },
        { label: "Staging", value: "staging" },
        { label: "Production", value: "production" },
        { label: "Test", value: "test" },
      ],
    },
    {
      key: "source",
      label: "Source",
      type: "checkbox",
      defaultValue: "",
      options: [
        { label: "API Endpoint", value: "api_endpoint" },
        { label: "Server-side Rendering", value: "server_side_rendering" },
        { label: "Partial Prerendering", value: "partial_prerendering" },
        { label: "Server Components", value: "server_components" },
        { label: "Cron Job", value: "cron_job" },
      ],
    },
  ],
});
