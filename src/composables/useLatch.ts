import { type Ref, ref, watch } from 'vue'

export function useLatch (source: () => boolean): Readonly<Ref<boolean>> {
  const latched = ref(source())
  if (!latched.value) {
    const stop = watch(source, value => {
      if (value) {
        latched.value = true
        stop()
      }
    })
  }
  return latched
}
