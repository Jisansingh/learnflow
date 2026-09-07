import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const metadata = {
  title: 'LearnFlow — AI-Powered Education Platform',
  description: 'Master any skill with custom AI-generated learning paths tailored precisely to your goals, schedule, and current knowledge level.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[#FAF9F5] font-body text-[#1B1C1A] min-h-screen flex flex-col antialiased">
        <Navbar />
        <main className="flex-1 pt-20">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
