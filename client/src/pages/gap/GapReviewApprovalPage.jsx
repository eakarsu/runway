// === Batch 11 Gaps & Frontend Mounts ===
import GapFeaturePage from '../../components/GapFeaturePage'
export default function GapReviewApprovalPage() {
  return (
    <GapFeaturePage
      title="Threaded Review/Approval"
      description="Threaded Review/Approval"
      slug="review-approval"
      aiResultKey="thread"
      fields={[
  {
    "name": "assetId",
    "label": "Asset ID",
    "required": true,
    "placeholder": ""
  },
  {
    "name": "reviewer",
    "label": "Reviewer",
    "required": false,
    "placeholder": ""
  }
]}
    />
  )
}
