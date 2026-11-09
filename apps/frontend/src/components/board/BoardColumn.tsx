import { StyleSheet, View } from 'react-native'
import type { BoardCardType, BoardColumnType, BoardSettingType } from '@pagewise/shared'

import { BoardCard } from '@components/board/BoardCard'
import { Button } from '@components/ui/Button'
import { EditableField } from '@components/ui/EditableField'
import { IconButton } from '@components/ui/IconButton'
import { colors, spacing } from '@styles/theme'

type BoardColumnProps = {
  column: BoardColumnType
  cardSettings: BoardSettingType['cards']
  onRename: (name: string) => void
  onRemove: () => void
  onAddCard: () => void
  onOpenCard: (cardId: number) => void
  onRenameCard: (cardId: number, name: string) => void
  onRemoveCard: (cardId: number) => void
}

export function BoardColumn({
  column,
  cardSettings,
  onRename,
  onRemove,
  onAddCard,
  onOpenCard,
  onRenameCard,
  onRemoveCard,
}: BoardColumnProps) {
  const renderCard = (card: BoardCardType) => (
    <BoardCard
      key={card.id}
      card={card}
      settings={cardSettings}
      onOpen={() => onOpenCard(card.id)}
      onRename={(name) => onRenameCard(card.id, name)}
      onRemove={() => onRemoveCard(card.id)}
    />
  )

  return (
    <View style={styles.column}>
      <View style={styles.header}>
        <View style={styles.name}>
          <EditableField
            value={column.name}
            autoFocus={column.name === ''}
            onSave={onRename}
            onEmpty={onRemove}
            underlineColor="secondary"
            background="tertiary"
            accessibilityLabel="Column name"
          />
        </View>
        <IconButton
          icon="menu"
          size={32}
          borderColor="tertiary"
          accessibilityLabel="Column options"
          dropdown={[{ name: 'Remove column', action: onRemove }]}
        />
      </View>
      {column.cards.length > 0 && <View style={styles.cards}>{column.cards.map(renderCard)}</View>}
      <Button label="Add card" variant="board" icon="plus" onPress={onAddCard} />
    </View>
  )
}

const styles = StyleSheet.create({
  column: {
    gap: spacing.lg,
    width: '100%',
    padding: spacing.lg,
    borderRadius: 16,
    backgroundColor: colors.page.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    gap: spacing.xl,
  },
  name: {
    flex: 1,
  },
  cards: {
    gap: 12,
  },
})
