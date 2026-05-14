// === Batch 11 Gaps & Frontend Mounts ===
import GapFeaturePage from '../../components/GapFeaturePage'
export default function GapDiffRestoreUiPage() {
  return (
    <GapFeaturePage
      title="Snapshot Diff/Restore"
      description="Snapshot Diff/Restore"
      slug="diff-restore-ui"
      aiResultKey="snapshot"
      fields={[
  {
    "name": "projectId",
    "label": "Project ID",
    "required": true,
    "placeholder": ""
  },
  {
    "name": "snapshotId",
    "label": "Snapshot ID",
    "required": false,
    "placeholder": ""
  }
]}
    />
  )
}
