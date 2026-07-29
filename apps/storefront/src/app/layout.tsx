import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import { CartProvider } from "@/context/CartContext"
import { AuthProvider } from "@/context/AuthContext"
import "styles/globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light">
      <body>
        <AuthProvider>
          <CartProvider>
            <main className="relative">{props.children}</main>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
