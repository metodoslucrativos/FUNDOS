import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
})

export const metadata: Metadata = {
  title: 'Controle Financeiro - Renda Fixa',
  description: 'Site para controle e monitoramento de aplicações financeiras em renda fixa.'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-900 text-gray-100`}>
        {/* Aqui podemos adicionar um Header/Navbar global no futuro */}
        <main className="min-h-screen p-4">
          {children}
        </main>
        {/* Aqui podemos adicionar um Footer global no futuro */}
      </body>
    </html>
  )
}

