import { type Ref, ref, watch } from 'vue'

/**
 * Fica `true` na primeira vez que a fonte fica `true`, e assim permanece. Serve para montar um diálogo
 * global (e baixar o chunk dele) só quando ele é aberto pela primeira vez, sem desmontar depois.
 */
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
