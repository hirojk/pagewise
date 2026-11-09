import { useState, type ReactNode } from 'react'
import { StyleSheet, View } from 'react-native'

const MIN_ITEM_WIDTH = 200
const GAP = 32

type ItemGridProps<T> = {
  items: T[]
  keyExtractor: (item: T) => string | number
  renderItem: (item: T) => ReactNode
  empty?: ReactNode
  draft?: ReactNode
}

export function ItemGrid<T>({ items, keyExtractor, renderItem, empty, draft }: ItemGridProps<T>) {
  const [width, setWidth] = useState(0)

  const columns = Math.max(1, Math.floor((width + GAP) / (MIN_ITEM_WIDTH + GAP)))
  const itemWidth = width ? (width - GAP * (columns - 1)) / columns : '100%'

  return (
    <View>
      {items.length === 0 && !draft && empty}
      <View style={styles.grid} onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
        {items.map((item) => (
          <View key={keyExtractor(item)} style={{ width: itemWidth }}>
            {renderItem(item)}
          </View>
        ))}
        {draft ? <View style={{ width: itemWidth }}>{draft}</View> : null}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
  },
})
