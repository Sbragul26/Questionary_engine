import { Inter } from 'next/font/google'
import Link from 'next/link'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Questionnaire AI',
  description: 'Auto-answer questionnaires using company documents',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="navbar">
          <div className="nav-container">
            <Link href="/" className="nav-logo">
              📋 Questionnaire AI
            </Link>
            <ul className="nav-menu">
              <li>
                <Link href="/login">Login</Link>
              </li>
              <li>
                <Link href="/signup">Sign Up</Link>
              </li>
            </ul>
          </div>
        </nav>
        <main className="main-content">{children}</main>
      </body>
    </html>
  )
}
