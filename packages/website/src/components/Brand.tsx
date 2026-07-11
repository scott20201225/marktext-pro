import { SECTIONS, hash } from '@/lib/sections'

export default function Brand() {
  return (
    <a className="brand" href={hash(SECTIONS.top)}>
      <img className="mark" src="/assets/logo.png" alt="MarkTextPro logo" width={28} height={28} />
      MarkTextPro
    </a>
  )
}
