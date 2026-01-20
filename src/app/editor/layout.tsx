import "@/app/globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";

export const metadata = {
  title: "写文章",
  description: "创作你的内容",
};

export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
        disableTransitionOnChange
        forcedTheme="dark"
      >
        {children}
      </ThemeProvider>
    </div>
  );
}
