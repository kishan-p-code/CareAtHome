import './globals.css';
import type { Metadata } from 'next';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CartDrawer from '../components/CartDrawer';

export const metadata: Metadata = {
  title: 'CareAtHome - Healthcare That Comes To You | Home Blood Collection India',
  description:
    'Book diagnostic blood tests online with pain-free home sample collection by certified phlebotomists. 100% cold-chain transport to NABL accredited partner laboratories with verified digital reports.',
  keywords:
    'home blood collection, blood tests at home, diagnostic tests bangalore, phlebotomist at home, CBC test, lipid profile, NABL labs india',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen flex flex-col justify-between selection:bg-teal-100 selection:text-teal-900">
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <CartDrawer />
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

