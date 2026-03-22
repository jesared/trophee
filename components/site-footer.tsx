import { Container } from "@/components/container";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 py-8 text-sm text-muted-foreground">
      <Container className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <span>
          (c) {new Date().getFullYear()} Trophée François Grieder. All rights
          reserved.
        </span>
        <div className="flex items-center gap-4">
          <span>Privacy</span>
          <span>Terms</span>
        </div>
      </Container>
    </footer>
  );
}
