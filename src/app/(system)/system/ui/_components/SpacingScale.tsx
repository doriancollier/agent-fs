const spacingScale = [
  { class: '0.5', px: 2 },
  { class: '1', px: 4 },
  { class: '1.5', px: 6 },
  { class: '2', px: 8 },
  { class: '3', px: 12 },
  { class: '4', px: 16 },
  { class: '5', px: 20 },
  { class: '6', px: 24 },
  { class: '8', px: 32 },
  { class: '10', px: 40 },
  { class: '12', px: 48 },
  { class: '16', px: 64 },
  { class: '20', px: 80 },
  { class: '24', px: 96 },
]

export function SpacingScale() {
  return (
    <div className="space-y-1">
      {spacingScale.map(({ class: cls, px }) => (
        <div key={cls} className="flex items-center gap-4">
          <div className="w-16 text-right">
            <span className="text-xs font-mono text-muted-foreground">{cls}</span>
          </div>
          <div
            className="h-4 bg-primary rounded-sm"
            style={{ width: `${px}px` }}
          />
          <span className="text-xs text-muted-foreground">{px}px</span>
        </div>
      ))}
    </div>
  )
}
