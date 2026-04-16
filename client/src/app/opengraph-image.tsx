import { ImageResponse } from 'next/og'
 
export const runtime = 'edge'
 
export const alt = 'vibeship - AI workflow OS for developers'
export const size = {
  width: 1200,
  height: 630,
}
 
export const contentType = 'image/png'
 
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0f172a',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
            }}
        >
             {/* Simple Logo Representation */}
            <svg
                width="80"
                height="80"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
            </svg>
        </div>
        <div
          style={{
            fontSize: 80,
            fontWeight: 'bold',
            color: 'white',
            letterSpacing: '-0.05em',
            marginBottom: '20px',
          }}
        >
          vibeship
        </div>
        <div
          style={{
            fontSize: 32,
            color: '#888888',
            textAlign: 'center',
            maxWidth: '800px',
          }}
        >
          Vibe code faster. Ship cleaner.
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
