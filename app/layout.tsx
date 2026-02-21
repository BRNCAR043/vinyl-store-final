import "./globals.css"
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { AuthProvider } from "../lib/AuthContext";
import { AuthModalProvider } from "../components/ui/AuthModal";
import ToastProvider from "../components/ui/ToastProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-b from-[#0b0202] via-[#0a0606] to-[#050505] text-white">
        <AuthProvider>
          <AuthModalProvider>
            <ToastProvider>
              <Header />
              {children}
              <Footer />
            </ToastProvider>
          </AuthModalProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
