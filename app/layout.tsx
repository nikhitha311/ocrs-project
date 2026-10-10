import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OCRS — Online Certificate Request System",
  description:
    "Automated academic credentials, verified issuance, QR validation, and secure payment processing.",
};

const themeScript = `
(function() {
  try {
    var savedTheme = localStorage.getItem('ocrs-theme');
    var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && systemDark)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: themeScript,
          }}
        />
      </head>
      <body className="bg-white dark:bg-neutral-950 text-slate-900 dark:text-neutral-100 min-h-screen antialiased selection:bg-blue-500 selection:text-white dark:selection:bg-neutral-800 dark:selection:text-white">
        {children}
      </body>
    </html>
  );
}
