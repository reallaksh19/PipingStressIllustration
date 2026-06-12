export function SvgDefs() {
  return <defs>
    <linearGradient id="pipeStroke" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0" stopColor="#8ea6bd"/>
      <stop offset="0.38" stopColor="#eef7ff"/>
      <stop offset="0.62" stopColor="#9fb3c8"/>
      <stop offset="1" stopColor="#526a82"/>
    </linearGradient>
    <linearGradient id="hotZone" x1="0" x2="1">
      <stop offset="0" stopColor="rgba(255,215,91,.20)"/>
      <stop offset="1" stopColor="rgba(255,75,100,.30)"/>
    </linearGradient>
    <radialGradient id="steelFace" cx="42%" cy="36%" r="72%">
      <stop offset="0" stopColor="#f4fbff"/>
      <stop offset="0.55" stopColor="#93aabe"/>
      <stop offset="1" stopColor="#40586e"/>
    </radialGradient>
    <radialGradient id="hotspot" cx="50%" cy="50%" r="50%">
      <stop offset="0" stopColor="rgba(255,215,91,.30)"/>
      <stop offset="0.58" stopColor="rgba(255,75,100,.16)"/>
      <stop offset="1" stopColor="rgba(255,75,100,0)"/>
    </radialGradient>
    <marker id="arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="4.2" markerHeight="4.2" orient="auto-start-reverse">
      <path d="M0 0L10 5L0 10Z" fill="#55b8ff"/>
    </marker>
    <marker id="arrowStart" viewBox="0 0 10 10" refX="1.5" refY="5" markerWidth="4.2" markerHeight="4.2" orient="auto-start-reverse">
      <path d="M10 0L0 5L10 10Z" fill="#55b8ff"/>
    </marker>
    <marker id="arrowRed" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="4.2" markerHeight="4.2" orient="auto-start-reverse">
      <path d="M0 0L10 5L0 10Z" fill="#ff4b64"/>
    </marker>
    <marker id="arrowRedStart" viewBox="0 0 10 10" refX="1.5" refY="5" markerWidth="4.2" markerHeight="4.2" orient="auto-start-reverse">
      <path d="M10 0L0 5L10 10Z" fill="#ff4b64"/>
    </marker>
    <marker id="arrowOrange" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="4.2" markerHeight="4.2" orient="auto-start-reverse">
      <path d="M0 0L10 5L0 10Z" fill="#ff9e3a"/>
    </marker>
    <marker id="arrowOrangeStart" viewBox="0 0 10 10" refX="1.5" refY="5" markerWidth="4.2" markerHeight="4.2" orient="auto-start-reverse">
      <path d="M10 0L0 5L10 10Z" fill="#ff9e3a"/>
    </marker>
  </defs>;
}
