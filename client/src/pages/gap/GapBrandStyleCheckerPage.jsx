// === Batch 11 Gaps & Frontend Mounts ===
import GapFeaturePage from '../../components/GapFeaturePage'
export default function GapBrandStyleCheckerPage() {
  return (
    <GapFeaturePage
      title="Brand-Style Consistency Checker"
      description="Brand-Style Consistency Checker"
      slug="brand-style-checker"
      aiResultKey="flags"
      fields={[
  {
    "name": "generations",
    "label": "Generations (JSON)",
    "type": "json"
  }
]}
    />
  )
}
