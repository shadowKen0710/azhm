import { Link } from "react-router-dom"

export function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-6 text-center">
      <div>
        <p className="font-display text-6xl font-extrabold text-ink">404</p>
        <p className="mt-3 text-lg font-medium text-muted-foreground">
          找不到这个页面
        </p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-full bg-ink px-8 py-3 text-base font-bold text-cream"
        >
          回首页
        </Link>
      </div>
    </main>
  )
}
