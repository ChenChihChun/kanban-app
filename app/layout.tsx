import './globals.css'
import type { Metadata } from 'next'
import { SessionProvider } from './providers'

export const metadata: Metadata = {
  title: 'Kanban Board',
  description: 'A kanban board with Google authentication',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
