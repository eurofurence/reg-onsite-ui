import { watchEffect } from 'vue'
import type { Ref } from 'vue'
import { buildPageSizeCss } from '@/types/printSettings'
import type { PrintSettings } from '@/types/printSettings'

export function usePageSizeStyle(printSettings: Ref<PrintSettings>) {
  const styleElement = document.createElement('style')
  document.head.appendChild(styleElement)

  watchEffect(() => {
    styleElement.textContent = `@page { size: ${buildPageSizeCss(printSettings.value)}; }`
  })
}
