export type BatchRequirementsWithCompliance = {
  batch_requirement_id: string | null;
  batch_title: string | null;
  compliance_percentage: number | null;
  coordinator_id: string | null;
  is_mandatory: boolean | null;
  is_predefined: boolean | null;
  not_submitted: number | null;
  pending_count: number | null;
  program_batch_id: string | null;
  requirement_description: string | null;
  requirement_name: string | null;
  requirement_type_id: string | null;
  submitted: number | null;
  submitted_count: number | null;
  total_trainees: number | null;
};
