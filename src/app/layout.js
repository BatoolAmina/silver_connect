import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GoogleWrapper from "@/components/GoogleWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    title: "Elderly Helper | Trusted Care",
    description: "Find trusted helpers, companions, and medical assistants.",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={`${inter.className} bg-gray-100 text-gray-900 flex flex-col min-h-screen`}>
                <GoogleWrapper>
                    <Navbar />
                    <main className="flex-grow">
                        {children}
                    </main>
                    <Footer />
                </GoogleWrapper>
            </body>
        </html>
    );
}