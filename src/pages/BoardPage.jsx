import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useBoardStore } from '../store/boardStore'
import { useAuthStore } from '../store/authStore'
import {
  DndContext, DragOverlay, PointerSensor, TouchSensor, useSensor, useSensors,
  closestCenter, defaultDropAnimationSideEffects,
} from '@dnd-kit/core'
import {
  SortableContext, horizontalListSortingStrategy,
  arrayMove, useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Spinner from '../components/Spinner'

function CardItem({ card, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id, data: { type: 'card', card },
  })
  return (
    <div ref={setNodeRef} style={{
      transform: CSS.Transform.toString(transform), transition,
      opacity: isDragging ? 0.4 : 1,
      background: 'white', borderRadius: '10px',
      padding: '14px 14px', marginBottom: '10px',
      minHeight: '56px',
      border: '1px solid #eee',
      boxShadow: isDragging ? '0 8px 24px rgba(0,0,0,0.12)' : '0 1px 3px rgba(0,0,0,0.06)',
      userSelect: 'none',
    }} {...attributes} {...listeners}>
      <div style={{ fontSize: '14px', color: '#1a1a2e', fontWeight: '500', marginBottom: '8px', cursor: 'grab' }}>
        {card.title}
      </div>
      {card.description ? (
        <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>{card.description}</div>
      ) : null}
      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
        <button
          onPointerDown={e => e.stopPropagation()}
          onClick={e => { e.stopPropagation(); onEdit(card) }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#888', padding: '2px 6px', borderRadius: '4px' }}>
          ✏️
        </button>
        <button
          onPointerDown={e => e.stopPropagation()}
          onClick={e => { e.stopPropagation(); onDelete(card.id) }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#888', padding: '2px 6px', borderRadius: '4px' }}>
          🗑️
        </button>
      </div>
    </div>
  )
}

function Column({ column, cards, boardId, onEditColumn, onDeleteColumn }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: column.id, data: { type: 'column', column },
  })
  const { createCard, updateCard, deleteCard } = useBoardStore()
  const [newCardTitle, setNewCardTitle] = useState('')
  const [showInput, setShowInput] = useState(false)
  const [editingCard, setEditingCard] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDesc, setEditDesc] = useState('')

  const handleAddCard = async (e) => {
    e.preventDefault()
    if (!newCardTitle.trim()) return
    await createCard(boardId, column.id, newCardTitle.trim())
    setNewCardTitle('')
    setShowInput(false)
  }

  const handleSaveEdit = async () => {
    await updateCard(editingCard.id, { title: editTitle, description: editDesc })
    setEditingCard(null)
  }

  return (
    <div ref={setNodeRef} style={{
      transform: CSS.Transform.toString(transform), transition,
      opacity: isDragging ? 0.5 : 1,
      background: '#f0f2ff', borderRadius: '14px',
      padding: '14px', width: 'min(280px, 80vw)', flexShrink: 0,
      maxHeight: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', cursor: 'grab' }}
        {...attributes} {...listeners}>
        <div style={{ fontWeight: '700', fontSize: '14px', color: '#1a1a2e' }}>
          {column.title}
          <span style={{ marginLeft: '6px', fontSize: '12px', color: '#888', fontWeight: '400' }}>{cards.length}</span>
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onPointerDown={e => e.stopPropagation()}
            onClick={e => { e.stopPropagation(); onEditColumn(column) }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', padding: '2px 4px' }}>✏️</button>
          <button
            onPointerDown={e => e.stopPropagation()}
            onClick={e => { e.stopPropagation(); onDeleteColumn(column.id) }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', padding: '2px 4px' }}>🗑️</button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', minHeight: '40px' }}>
        <SortableContext items={cards.map(c => c.id)}>
          {cards.map(card => (
            <CardItem key={card.id} card={card}
              onEdit={c => { setEditingCard(c); setEditTitle(c.title); setEditDesc(c.description || '') }}
              onDelete={deleteCard}
            />
          ))}
        </SortableContext>
      </div>

      {showInput ? (
        <form onSubmit={handleAddCard} style={{ marginTop: '8px' }}>
          <textarea
            autoFocus value={newCardTitle} onChange={e => setNewCardTitle(e.target.value)}
            placeholder="Kart başlığı..." rows={2}
            style={{
              width: '100%', border: '1.5px solid #667eea', borderRadius: '8px',
              padding: '8px 10px', fontSize: '13px', outline: 'none',
              resize: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
            }}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddCard(e) } }}
          />
          <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
            <button type="submit" style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white',
              border: 'none', borderRadius: '8px', padding: '7px 14px',
              fontSize: '13px', fontWeight: '600', cursor: 'pointer',
            }}>Ekle</button>
            <button type="button" onClick={() => setShowInput(false)} style={{
              background: 'none', border: '1px solid #ddd', borderRadius: '8px',
              padding: '7px 10px', fontSize: '13px', color: '#888', cursor: 'pointer',
            }}>İptal</button>
          </div>
        </form>
      ) : (
        <button onClick={() => setShowInput(true)} style={{
          marginTop: '8px', background: 'none', border: '1.5px dashed #c0c4f0',
          borderRadius: '8px', padding: '8px', fontSize: '13px', color: '#667eea',
          cursor: 'pointer', width: '100%', textAlign: 'left',
        }}>+ Kart ekle</button>
      )}

      {editingCard && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }} onClick={() => setEditingCard(null)}>
          <div style={{
            background: 'white', borderRadius: '16px', padding: '24px', width: '400px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '700' }}>Kartı Düzenle</h3>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#444' }}>Başlık</label>
            <input value={editTitle} onChange={e => setEditTitle(e.target.value)} style={{
              width: '100%', border: '1.5px solid #e0e0e0', borderRadius: '8px',
              padding: '9px 12px', fontSize: '14px', outline: 'none',
              marginTop: '6px', marginBottom: '14px', boxSizing: 'border-box',
            }}/>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#444' }}>Açıklama</label>
            <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)}
              rows={3} placeholder="Açıklama ekle..." style={{
                width: '100%', border: '1.5px solid #e0e0e0', borderRadius: '8px',
                padding: '9px 12px', fontSize: '14px', outline: 'none',
                marginTop: '6px', resize: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
              }}/>
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px', justifyContent: 'flex-end' }}>
              <button onClick={() => setEditingCard(null)} style={{
                background: 'none', border: '1px solid #e0e0e0', borderRadius: '8px',
                padding: '9px 18px', fontSize: '14px', color: '#888', cursor: 'pointer',
              }}>İptal</button>
              <button onClick={handleSaveEdit} style={{
                background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white',
                border: 'none', borderRadius: '8px', padding: '9px 20px',
                fontSize: '14px', fontWeight: '600', cursor: 'pointer',
              }}>Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function BoardPage() {
  const { id: boardId } = useParams()
  const navigate = useNavigate()
  const { signOut } = useAuthStore()
  const { currentBoard, columns, cards, fetchBoard, updateBoardTitle, fetchColumns, fetchCards, createColumn, updateColumnTitle, deleteColumn, reorderColumns, moveCard } = useBoardStore()
  const [newColTitle, setNewColTitle] = useState('')
  const [showColInput, setShowColInput] = useState(false)
  const [editingColumn, setEditingColumn] = useState(null)
  const [editColTitle, setEditColTitle] = useState('')
  const [activeItem, setActiveItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editingBoardTitle, setEditingBoardTitle] = useState(false)
  const [boardTitleDraft, setBoardTitleDraft] = useState('')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 1 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 12 } }),
  )

  useEffect(() => {
    setLoading(true)
    Promise.all([fetchBoard(boardId), fetchColumns(boardId), fetchCards(boardId)])
      .finally(() => setLoading(false))
  }, [boardId])

  const handleAddColumn = async (e) => {
    e.preventDefault()
    if (!newColTitle.trim()) return
    await createColumn(boardId, newColTitle.trim())
    setNewColTitle('')
    setShowColInput(false)
  }

  const handleSaveColumnEdit = async () => {
    await updateColumnTitle(editingColumn.id, editColTitle)
    setEditingColumn(null)
  }

  const handleDragStart = ({ active }) => {
    const type = active.data.current?.type
    if (type === 'card') setActiveItem({ type: 'card', data: active.data.current.card })
    else if (type === 'column') setActiveItem({ type: 'column', data: active.data.current.column })
  }

  const handleDragEnd = async ({ active, over }) => {
    setActiveItem(null)
    if (!over) return

    const activeType = active.data.current?.type
    const overType = over.data.current?.type

    if (activeType === 'column') {
      if (active.id === over.id) return
      const oldIdx = columns.findIndex(c => c.id === active.id)
      const newIdx = columns.findIndex(c => c.id === over.id)
      if (oldIdx === -1 || newIdx === -1 || oldIdx === newIdx) return
      const reordered = arrayMove(columns, oldIdx, newIdx).map((c, i) => ({ ...c, position: (i + 1) * 1000 }))
      await reorderColumns(reordered)
      return
    }

    if (activeType === 'card') {
      const activeCard = cards.find(c => c.id === active.id)
      if (!activeCard) return

      let newColumnId = activeCard.column_id
      const overCard = cards.find(c => c.id === over.id)

      if (overType === 'column') newColumnId = over.id
      else if (overType === 'card' && overCard) newColumnId = overCard.column_id

      const colCards = cards
        .filter(c => c.column_id === newColumnId && c.id !== active.id)
        .sort((a, b) => a.position - b.position)

      let newPosition
      if (overType === 'column' || colCards.length === 0) {
        newPosition = colCards.length === 0 ? 1000 : colCards[colCards.length - 1].position + 1000
      } else {
        const overIdx = colCards.findIndex(c => c.id === over.id)
        if (overIdx === -1) {
          newPosition = colCards[colCards.length - 1].position + 1000
        } else {
          const prev = overIdx > 0 ? colCards[overIdx - 1].position : 0
          const next = colCards[overIdx].position
          newPosition = (prev + next) / 2
        }
      }

      await moveCard(active.id, newColumnId, newPosition)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9ff', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        background: 'white', borderBottom: '1px solid #eee',
        padding: '0 24px', height: '52px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => navigate('/')} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '13px', color: '#667eea', fontWeight: '600', padding: 0,
          }}>← Board'larım</button>
          {currentBoard && (
            <span
              onClick={() => { setBoardTitleDraft(currentBoard.title); setEditingBoardTitle(true) }}
              style={{ fontSize: '14px', fontWeight: '700', color: '#1a1a2e', cursor: 'pointer', padding: '4px 8px', borderRadius: '6px' }}
              title="Düzenle"
            >
              {currentBoard.title}
            </span>
          )}
        </div>
        <button onClick={signOut}
          onMouseEnter={e => { e.currentTarget.style.background = '#fff5f5'; e.currentTarget.style.borderColor = '#feb2b2'; e.currentTarget.style.color = '#c53030' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = '#e0e0e0'; e.currentTarget.style.color = '#666' }}
          style={{
            background: 'none', border: '1px solid #e0e0e0', borderRadius: '8px',
            padding: '6px 14px', fontSize: '13px', color: '#666', cursor: 'pointer',
            transition: 'all 0.15s',
          }}>Çıkış</button>
      </div>

      {loading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Spinner size={32} />
        </div>
      ) : (
      <div style={{ flex: 1, overflowX: 'auto', padding: '24px' }}>
        <DndContext sensors={sensors} collisionDetection={closestCenter}
          onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          {columns.length === 0 && !showColInput && (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              padding: '60px 20px', textAlign: 'center',
              animation: 'fadeIn 0.3s ease-out',
            }}>
              <div style={{
                width: '72px', height: '72px',
                background: 'linear-gradient(135deg, #667eea33, #764ba233)',
                borderRadius: '20px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '20px',
              }}>
                <svg width="32" height="32" fill="none" stroke="#667eea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="6" height="18" rx="1.5"/>
                  <rect x="11" y="3" width="6" height="12" rx="1.5"/>
                  <rect x="19" y="3" width="2" height="8" rx="1"/>
                </svg>
              </div>
              <h2 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: '700', color: '#1a1a2e' }}>
                Board'un boş
              </h2>
              <p style={{ margin: '0 0 20px', fontSize: '14px', color: '#888', maxWidth: '300px' }}>
                Görevlerini organize etmek için sütun ekleyerek başla. Örneğin "Yapılacak", "Devam Ediyor", "Tamamlandı".
              </p>
              <button onClick={() => setShowColInput(true)} style={{
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white', border: 'none', borderRadius: '10px',
                padding: '10px 20px', fontSize: '14px', fontWeight: '600',
                cursor: 'pointer',
              }}>+ İlk sütununu ekle</button>
            </div>
          )}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', minWidth: 'max-content' }}>
            <SortableContext items={columns.map(c => c.id)} strategy={horizontalListSortingStrategy}>
              {columns.map(col => (
                <Column key={col.id} column={col} boardId={boardId}
                  cards={cards.filter(c => c.column_id === col.id).sort((a, b) => a.position - b.position)}
                  onEditColumn={c => { setEditingColumn(c); setEditColTitle(c.title) }}
                  onDeleteColumn={deleteColumn}
                />
              ))}
            </SortableContext>

            {showColInput ? (
              <form onSubmit={handleAddColumn} style={{
                background: '#f0f2ff', borderRadius: '14px', padding: '14px',
                width: 'min(280px, 80vw)', flexShrink: 0,
              }}>
                <input autoFocus value={newColTitle} onChange={e => setNewColTitle(e.target.value)}
                  placeholder="Sütun adı..." style={{
                    width: '100%', border: '1.5px solid #667eea', borderRadius: '8px',
                    padding: '9px 12px', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                  }}/>
                <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                  <button type="submit" style={{
                    background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white',
                    border: 'none', borderRadius: '8px', padding: '8px 16px',
                    fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                  }}>Ekle</button>
                  <button type="button" onClick={() => setShowColInput(false)} style={{
                    background: 'none', border: '1px solid #ddd', borderRadius: '8px',
                    padding: '8px 12px', fontSize: '13px', color: '#888', cursor: 'pointer',
                  }}>İptal</button>
                </div>
              </form>
            ) : (columns.length > 0 && (
              <button onClick={() => setShowColInput(true)} style={{
                background: 'rgba(255,255,255,0.7)', border: '2px dashed #c0c4f0',
                borderRadius: '14px', padding: '14px 20px', width: 'min(280px, 80vw)', flexShrink: 0,
                fontSize: '14px', color: '#667eea', cursor: 'pointer', textAlign: 'left', fontWeight: '600',
              }}>+ Sütun ekle</button>
            ))}
          </div>

          <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.4' } } }) }}>
            {activeItem?.type === 'card' && (
              <div style={{
                background: 'white', borderRadius: '10px', padding: '12px 14px',
                border: '1px solid #eee', boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
                width: '252px', fontSize: '14px', fontWeight: '500', color: '#1a1a2e',
              }}>{activeItem.data.title}</div>
            )}
            {activeItem?.type === 'column' && (
              <div style={{
                background: '#f0f2ff', borderRadius: '14px', padding: '14px',
                width: '280px', boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
                fontWeight: '700', fontSize: '14px', color: '#1a1a2e',
              }}>{activeItem.data.title}</div>
            )}
          </DragOverlay>
        </DndContext>
      </div>
      )}

      {editingBoardTitle && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setEditingBoardTitle(false)}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', width: '380px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '700' }}>Board adı</h3>
            <input autoFocus value={boardTitleDraft} onChange={e => setBoardTitleDraft(e.target.value)}
              onKeyDown={async (e) => { if (e.key === 'Enter' && boardTitleDraft.trim()) { await updateBoardTitle(boardId, boardTitleDraft.trim()); setEditingBoardTitle(false) } }}
              style={{ width: '100%', border: '1.5px solid #e0e0e0', borderRadius: '8px', padding: '9px 12px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}/>
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px', justifyContent: 'flex-end' }}>
              <button onClick={() => setEditingBoardTitle(false)} style={{ background: 'none', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '9px 18px', fontSize: '14px', color: '#888', cursor: 'pointer' }}>İptal</button>
              <button onClick={async () => { if (!boardTitleDraft.trim()) return; await updateBoardTitle(boardId, boardTitleDraft.trim()); setEditingBoardTitle(false) }} style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: '8px', padding: '9px 20px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>Kaydet</button>
            </div>
          </div>
        </div>
      )}

      {editingColumn && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }} onClick={() => setEditingColumn(null)}>
          <div style={{
            background: 'white', borderRadius: '16px', padding: '24px', width: '360px',
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '700' }}>Sütunu Düzenle</h3>
            <input value={editColTitle} onChange={e => setEditColTitle(e.target.value)} style={{
              width: '100%', border: '1.5px solid #e0e0e0', borderRadius: '8px',
              padding: '9px 12px', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
            }}/>
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px', justifyContent: 'flex-end' }}>
              <button onClick={() => setEditingColumn(null)} style={{
                background: 'none', border: '1px solid #e0e0e0', borderRadius: '8px',
                padding: '9px 18px', fontSize: '14px', color: '#888', cursor: 'pointer',
              }}>İptal</button>
              <button onClick={handleSaveColumnEdit} style={{
                background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white',
                border: 'none', borderRadius: '8px', padding: '9px 20px',
                fontSize: '14px', fontWeight: '600', cursor: 'pointer',
              }}>Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
