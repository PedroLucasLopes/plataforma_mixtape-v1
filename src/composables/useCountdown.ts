import { onScopeDispose, readonly, ref } from 'vue'

/** Contagem regressiva em segundos (ex.: "Enviar de novo em 42 s"). */
export function useCountdown () {
  const remaining = ref(0)
  let timer: ReturnType<typeof setInterval> | undefined

  function stop (): void {
    clearInterval(timer)
    timer = undefined
  }

  function start (seconds: number): void {
    stop()
    remaining.value = seconds
    timer = setInterval(() => {
      remaining.value = Math.max(0, remaining.value - 1)
      if (remaining.value === 0) {
        stop()
      }
    }, 1000)
  }

  onScopeDispose(stop)

  return { remaining: readonly(remaining), start }
}
