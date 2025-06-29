import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Peasy Money",
  description: "Peasy Money is a PEA tracker",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}
        <Toaster 
          richColors 
          position="bottom-right" 
          toastOptions={{
            style: {
              backgroundColor: "#1a0033", // fond toast
              color: "#ffffff",           // texte
              border: "1px solid #7303c0", // bordure violette
            },
            className: "shadow-lg rounded-lg",
            descriptionClassName: "text-sm text-[#ec38bc]",
            actionButtonStyle: {
              backgroundColor: "#7303c0",
              color: "#ffffff",
            },
          }}
        />
      </body>
    </html>
  )
}
