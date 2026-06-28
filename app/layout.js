import "./globals.css";

export const metadata = {
  title: "KRONA — Студія Сучасних та Мінімалістичних Меблів",
  description: "Ексклюзивні меблі від українського виробника KRONA. Натуральні матеріали, скандинавський мінімалізм, ергономічність та гарантія якості.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="uk">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
