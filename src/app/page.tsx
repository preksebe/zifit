export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-md overflow-hidden rounded-lg border border-border bg-card">
        <div className="h-2 bg-sport" />
        <div className="p-8 text-center">
          <h1 className="text-5xl uppercase tracking-wide">ZiFit</h1>
          <p className="mt-3 text-lg text-foreground">În construcție</p>
          <p className="mt-2 text-sm text-muted">
            Proiect de test. Conținutul va fi marcat ca atare.
          </p>
        </div>
      </div>
    </main>
  );
}
