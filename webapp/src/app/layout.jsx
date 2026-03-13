import './globals.css'

export const metadata = {
  title: 'Latenza Vita — AI Water Quality Monitor',
  description:
    'AI-powered municipal water quality monitoring system aligned with SDG 6 — Clean Water and Sanitation.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="lv-mesh min-h-screen flex">
        {children}
      </body>
    </html>
  )
}