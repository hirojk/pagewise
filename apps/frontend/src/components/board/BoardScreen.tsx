import { useEffect, useRef, useState, type ComponentRef } from 'react'
import { Platform, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native'
import { GestureDetector, MouseButton, usePanGesture } from 'react-native-gesture-handler'
import Animated, { scrollTo, useAnimatedRef, useScrollOffset, useSharedValue } from 'react-native-reanimated'
import Sortable from 'react-native-sortables'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { BoardColumnType, BoardType } from '@pagewise/shared'

import { BoardCardModal } from '@components/board/BoardCardModal'
import { BoardColumn } from '@components/board/BoardColumn'
import { BoardSettingModal } from '@components/board/BoardSettingModal'
import { PageHeader } from '@components/layout/PageHeader'
import { Button } from '@components/ui/Button'
import { useKeepFocusedInputVisible } from '@hooks/useIosInteractions'
import { useBoardStore } from '@stores/boardStore'
import { usePageStore } from '@stores/pageStore'
import { useProject } from '@stores/projectStore'
import { colors, NARROW_BREAKPOINT, spacing } from '@styles/theme'
import {
  addCard,
  addColumn,
  createCard,
  createColumn,
  findCard,
  moveColumn,
  removeCard,
  removeColumn,
  renameColumn,
  updateCard,
  updateSettings,
  type CardRef,
} from '@utils/board'

const COLUMN_WIDTH = 275
const COLUMN_GAP = spacing.lg
const HOLD_TIME = 750

export function BoardScreen({ projectId, page: board }: { projectId: number; page: BoardType }) {
  const insets = useSafeAreaInsets()
  const isNarrow = useWindowDimensions().width < NARROW_BREAKPOINT
  const paddingX = isNarrow ? spacing.lg : spacing.pageX
  const project = useProject(projectId)
  const loadBoard = useBoardStore((state) => state.loadBoard)
  const updateBoard = useBoardStore((state) => state.updateBoard)
  const renamePage = usePageStore((state) => state.renamePage)
  const deletePage = usePageStore((state) => state.deletePage)

  const [openCard, setOpenCard] = useState<CardRef | null>(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isDeletePromptOpen, setIsDeletePromptOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    loadBoard(projectId, board.id).catch((error) => console.error('Error loading board:', error))
  }, [projectId, board.id, loadBoard])

  const change = (update: (board: BoardType) => BoardType, options?: { persist?: boolean }) =>
    updateBoard(projectId, board.id, update, options).catch((error) => console.error('Error updating board:', error))

  const boardScrollRef = useAnimatedRef<Animated.ScrollView>()
  const pageScrollRef = useRef<ComponentRef<typeof ScrollView>>(null)
  const keyboardPadding = useKeepFocusedInputVisible(pageScrollRef)

  const boardScrollX = useScrollOffset(boardScrollRef)
  const dragScrollStart = useSharedValue(0)
  const isColumnDragging = useSharedValue(false)
  const dragScroll = usePanGesture({
    enabled: Platform.OS === 'web',
    mouseButton: MouseButton.LEFT,
    activeOffsetX: [-5, 5],
    activeCursor: 'grabbing',
    cancelsJSResponder: true,
    onActivate: () => {
      'worklet'
      dragScrollStart.value = boardScrollX.value
    },
    onUpdate: (event) => {
      'worklet'
      if (isColumnDragging.value) return
      scrollTo(boardScrollRef, dragScrollStart.value - event.translationX, 0, false)
    },
  })

  const handleDeleteBoard = async () => {
    setIsDeleting(true)
    try {
      await deletePage(projectId, board)
      setIsDeletePromptOpen(false)
      setIsSettingsOpen(false)
      router.replace({ pathname: '/[projectId]', params: { projectId: String(projectId) } })
    } catch (error) {
      console.error('Error deleting board:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const renderColumn = (column: BoardColumnType) => (
    <BoardColumn
      column={column}
      cardSettings={board.settings.cards}
      onRename={(name) => change((current) => renameColumn(current, column.id, name))}
      onRemove={() => change((current) => removeColumn(current, column.id))}
      onAddCard={() => change((current) => addCard(current, column.id, createCard()), { persist: false })}
      onOpenCard={(cardId) => setOpenCard([column.id, cardId])}
      onRenameCard={(cardId, name) => change((current) => updateCard(current, [column.id, cardId], { name }))}
      onRemoveCard={(cardId) => change((current) => removeCard(current, [column.id, cardId]))}
    />
  )

  return (
    <View style={styles.page}>
      <Sortable.PortalProvider>
        <ScrollView
          ref={pageScrollRef}
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + spacing.pageY, paddingBottom: keyboardPadding },
          ]}
        >
          <PageHeader
            style={{ paddingHorizontal: paddingX }}
            crumbs={[
              { label: 'Home', href: '/' },
              {
                label: project?.name || 'Project',
                href: { pathname: '/[projectId]', params: { projectId: String(projectId) } },
              },
              {
                label: board.name || 'Board',
                href: {
                  pathname: '/[projectId]/[componentId]',
                  params: { projectId: String(projectId), componentId: String(board.id) },
                },
              },
            ]}
            initial={{ icon: 'board', usage: 'page' }}
            name={board.name}
            nameLabel="Board name"
            onRename={(name) => renamePage(projectId, board, name)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            settingsLabel="Board settings"
          />

          <GestureDetector gesture={dragScroll}>
            <Animated.ScrollView
              ref={boardScrollRef}
              horizontal
              style={styles.boardScroll}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={[
                styles.board,
                { paddingHorizontal: paddingX, paddingBottom: insets.bottom + spacing.pageY },
              ]}
              accessibilityLabel="Board columns"
            >
              <Sortable.Flex
                flexDirection="row"
                flexWrap="nowrap"
                alignItems="flex-start"
                gap={COLUMN_GAP}
                dragActivationDelay={HOLD_TIME}
                scrollableRef={boardScrollRef}
                autoScrollDirection="horizontal"
                autoScrollActivationOffset={100}
                showDropIndicator
                dropIndicatorStyle={styles.dropIndicator}
                activeItemScale={1}
                activeItemOpacity={0.8}
                inactiveItemOpacity={1}
                onDragStart={() => {
                  isColumnDragging.value = true
                }}
                onDragEnd={({ fromIndex, toIndex }) => {
                  isColumnDragging.value = false
                  if (fromIndex !== toIndex) change((current) => moveColumn(current, fromIndex, toIndex))
                }}
              >
                {board.columns.map((column) => (
                  <View key={column.id} style={styles.columnWrapper}>
                    {renderColumn(column)}
                  </View>
                ))}
              </Sortable.Flex>
              <View style={styles.columnWrapper}>
                <Button
                  label="Add column"
                  variant="board"
                  icon="plus"
                  onPress={() => change((current) => addColumn(current, createColumn()))}
                />
              </View>
            </Animated.ScrollView>
          </GestureDetector>
        </ScrollView>
      </Sortable.PortalProvider>

      <BoardCardModal
        visible={!!openCard}
        card={openCard ? findCard(board, openCard) : undefined}
        settings={board.settings.modal}
        onClose={() => setOpenCard(null)}
        onUpdate={(updates) => openCard && change((current) => updateCard(current, openCard, updates))}
        onRemove={() => {
          if (!openCard) return
          setOpenCard(null)
          change((current) => removeCard(current, openCard))
        }}
      />

      <BoardSettingModal
        visible={isSettingsOpen}
        boardName={board.name}
        settings={board.settings}
        onClose={() => setIsSettingsOpen(false)}
        onChange={(section, key, value) => change((current) => updateSettings(current, section, key, value))}
        isDeletePromptOpen={isDeletePromptOpen}
        isDeleting={isDeleting}
        onRequestDelete={() => setIsDeletePromptOpen(true)}
        onConfirmDelete={handleDeleteBoard}
        onCancelDelete={() => setIsDeletePromptOpen(false)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    gap: spacing.xl,
  },
  boardScroll: {
    flexGrow: 1,
  },
  board: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: COLUMN_GAP,
  },
  columnWrapper: {
    flexShrink: 0,
    width: COLUMN_WIDTH,
  },
  dropIndicator: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.brandPrimary,
    borderRadius: 16,
  },
})
