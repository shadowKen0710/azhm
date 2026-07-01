import { QueryClient } from "@tanstack/react-query"

// 全局 QueryClient：POC 数据为 mock，故不自动重试、staleTime 适中。
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
})
