import { ImageResponse } from 'next/og'

export const alt = 'CrocoDillon — Notes from the web'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: '#f8f9f5',
        color: '#20291e',
        padding: 70,
        width: '100%',
        height: '100%',
      }}
    >
      <div style={{ fontSize: 28 }}>crocodillon.</div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          fontSize: 94,
          letterSpacing: -5,
          lineHeight: 1.05,
        }}
      >
        <span>Notes from</span>
        <span style={{ color: '#3a643f' }}>the web.</span>
      </div>
      <div style={{ fontSize: 22, color: '#677061' }}>
        JavaScript, browsers & useful rabbit holes · Dillon de Voor
      </div>
    </div>,
    size
  )
}
