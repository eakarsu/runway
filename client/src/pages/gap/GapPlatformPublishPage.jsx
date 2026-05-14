// === Batch 11 Gaps & Frontend Mounts ===
import GapFeaturePage from '../../components/GapFeaturePage'
export default function GapPlatformPublishPage() {
  return (
    <GapFeaturePage
      title="Direct YouTube/TikTok/IG Publish"
      description="Direct YouTube/TikTok/IG Publish"
      slug="platform-publish"
      aiResultKey="publish"
      fields={[
  {
    "name": "platform",
    "label": "Platform",
    "required": false,
    "placeholder": ""
  },
  {
    "name": "assetId",
    "label": "Asset ID",
    "required": false,
    "placeholder": ""
  }
]}
    />
  )
}
