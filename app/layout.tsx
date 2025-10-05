import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kanban Board',
  description: 'A simple kanban board app',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW">
      <body>{children}</body>
    </html>
  )
}
