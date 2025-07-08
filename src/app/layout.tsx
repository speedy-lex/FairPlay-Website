import './globals.css'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Fair Play' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
