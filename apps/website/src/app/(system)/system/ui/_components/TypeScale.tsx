export function TypeScale() {
  return (
    <div className="space-y-8">
      {/* Headings */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-muted-foreground">Headings</h4>
        <div className="space-y-4 border-l-2 pl-4">
          <div>
            <span className="text-xs text-muted-foreground font-mono">h1 - 2.441rem / 39px</span>
            <h1 className="text-4xl font-bold tracking-tight">The quick brown fox</h1>
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-mono">h2 - 1.953rem / 31px</span>
            <h2 className="text-3xl font-semibold tracking-tight">The quick brown fox</h2>
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-mono">h3 - 1.563rem / 25px</span>
            <h3 className="text-2xl font-semibold">The quick brown fox</h3>
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-mono">h4 - 1.25rem / 20px</span>
            <h4 className="text-xl font-medium">The quick brown fox</h4>
          </div>
        </div>
      </div>

      {/* Body Text */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-muted-foreground">Body Text</h4>
        <div className="space-y-3 border-l-2 pl-4">
          <div>
            <span className="text-xs text-muted-foreground font-mono">text-base - 1rem / 16px</span>
            <p className="text-base">The quick brown fox jumps over the lazy dog.</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-mono">text-sm - 0.875rem / 14px</span>
            <p className="text-sm">The quick brown fox jumps over the lazy dog.</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-mono">text-xs - 0.75rem / 12px</span>
            <p className="text-xs">The quick brown fox jumps over the lazy dog.</p>
          </div>
        </div>
      </div>

      {/* Font Weights */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-muted-foreground">Font Weights</h4>
        <div className="space-y-2 border-l-2 pl-4">
          <p className="font-normal"><span className="text-xs text-muted-foreground font-mono mr-4">400</span>Normal weight text</p>
          <p className="font-medium"><span className="text-xs text-muted-foreground font-mono mr-4">500</span>Medium weight text</p>
          <p className="font-semibold"><span className="text-xs text-muted-foreground font-mono mr-4">600</span>Semibold weight text</p>
          <p className="font-bold"><span className="text-xs text-muted-foreground font-mono mr-4">700</span>Bold weight text</p>
        </div>
      </div>

      {/* Code */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-muted-foreground">Code (Geist Mono)</h4>
        <div className="border-l-2 pl-4">
          <code className="px-1.5 py-0.5 rounded bg-muted font-mono text-sm">
            const example = &quot;Geist Mono&quot;
          </code>
          <pre className="mt-2 p-4 rounded-lg bg-muted overflow-x-auto">
            <code className="font-mono text-sm">{`function greet(name: string) {
  return \`Hello, \${name}!\`
}`}</code>
          </pre>
        </div>
      </div>
    </div>
  )
}
