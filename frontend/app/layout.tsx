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
              backgroundColor: "#f5f5f5",
              color: "#222222",
              border: "1px solid #cccccc",
            },
            className: "shadow-md rounded-md",
            descriptionClassName: "text-xs text-gray-700",
            actionButtonStyle: {
              backgroundColor: "#cccccc",
              color: "#222222",
            }
          }}
        />
      </body>
    </html>
  )
}
