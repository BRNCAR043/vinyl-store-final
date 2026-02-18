import "./globals.css"
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-b from-[#0b0202] via-[#0a0606] to-[#050505] text-white">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  )
}
