import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'
import { CrocodileMark } from '@/components/icons'

export const socialImageSize = { width: 2400, height: 1260 }

const serif = readFile(
  join(
    process.cwd(),
    'node_modules/@fontsource/libre-baskerville/files/libre-baskerville-latin-400-normal.woff'
  )
)
const sans = readFile(
  join(
    process.cwd(),
    'node_modules/@fontsource/inter/files/inter-latin-400-normal.woff'
  )
)

export async function createSocialImage({
  title,
  subtitle = 'JavaScript, browsers & useful rabbit holes',
}: {
  title: string
  subtitle?: string
}) {
  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        height: '100%',
        padding: 128,
        background: '#f8f9f5',
        color: '#20291e',
        fontFamily: 'Inter',
      }}
    >
      <div
        style={{
          position: 'absolute',
          right: -240,
          top: 300,
          width: 840,
          height: 840,
          borderRadius: '50%',
          border: '3px solid #dce1d6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: 650,
            height: 650,
            borderRadius: '50%',
            border: '3px solid #dce1d6',
          }}
        />
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 24,
          fontSize: 54,
          letterSpacing: -2,
        }}
      >
        <CrocodileMark
          width={80}
          height={80}
          fill="#3a643f"
          eyeFill="#f8f9f5"
        />
        crocodillon.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
        <div style={{ fontSize: 30, letterSpacing: 8, color: '#3a643f' }}>
          NOTES FROM THE WEB
        </div>
        <div
          style={{
            fontFamily: 'Libre Baskerville',
            fontSize: title.length > 55 ? 112 : 132,
            lineHeight: 1.15,
            letterSpacing: -5,
            maxWidth: 2040,
          }}
        >
          {title}
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 28,
          borderTop: '2px solid #dce1d6',
          paddingTop: 36,
          fontSize: 36,
          color: '#677061',
        }}
      >
        <div>{subtitle}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Dillon de Voor</span>
          <span style={{ color: '#3a643f' }}>crocodillon.com</span>
        </div>
      </div>
    </div>,
    {
      ...socialImageSize,
      fonts: [
        { name: 'Inter', data: await sans, weight: 400, style: 'normal' },
        {
          name: 'Libre Baskerville',
          data: await serif,
          weight: 400,
          style: 'normal',
        },
      ],
    }
  )
}
