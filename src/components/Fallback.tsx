/** 懒加载 Suspense 兜底：温和的品牌加载态。 */
export function Fallback() {
  return (
    <div className="grid min-h-screen place-items-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-pulse-soft rounded-2xl bg-sun" />
        <p className="text-sm font-semibold text-muted-foreground">加载中…</p>
      </div>
    </div>
  )
}
