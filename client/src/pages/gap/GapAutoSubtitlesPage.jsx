// === Batch 11 Gaps & Frontend Mounts ===
import GapFeaturePage from '../../components/GapFeaturePage'
export default function GapAutoSubtitlesPage() {
  return (
    <GapFeaturePage
      title="Auto-Subtitle Generator"
      description="Auto-Subtitle Generator"
      slug="auto-subtitles"
      aiResultKey="subtitles"
      fields={[
  {
    "name": "transcript",
    "label": "Transcript",
    "type": "textarea",
    "rows": 4,
    "required": true
  }
]}
    />
  )
}
