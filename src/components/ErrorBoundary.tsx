import { Component, type ReactNode } from "react"

interface Props {
  children: ReactNode
}
interface State {
  error: Error | null
}

/** 顶层错误边界：捕获渲染期异常，避免整页白屏。 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  reset = () => this.setState({ error: null })

  render() {
    if (this.state.error) {
      return (
        <main className="grid min-h-screen place-items-center bg-background px-6 text-center">
          <div>
            <p className="font-display text-2xl font-extrabold text-ink">
              出了点问题
            </p>
            <p className="mt-2 max-w-[280px] text-sm text-muted-foreground">
              页面遇到意外错误。刷新或返回后重试。
            </p>
            <button
              onClick={this.reset}
              className="mt-6 rounded-full bg-ink px-8 py-3 text-base font-bold text-cream"
            >
              重试
            </button>
          </div>
        </main>
      )
    }
    return this.props.children
  }
}
