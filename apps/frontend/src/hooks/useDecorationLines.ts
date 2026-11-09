import { useState } from 'react'
import type { LayoutChangeEvent } from 'react-native'

const LINE_SPACING = 80

export const useDecorationLines = () => {
  const [viewportHeight, setViewportHeight] = useState(0)
  const [contentHeight, setContentHeight] = useState(0)

  const lineCount = Math.max(1, Math.ceil(Math.max(viewportHeight, contentHeight) / LINE_SPACING))

  return {
    lineCount,
    onViewportLayout: (event: LayoutChangeEvent) => setViewportHeight(event.nativeEvent.layout.height),
    onContentLayout: (event: LayoutChangeEvent) => setContentHeight(event.nativeEvent.layout.height),
  }
}
