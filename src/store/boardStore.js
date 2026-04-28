import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useBoardStore = create((set, get) => ({
  boards: [],
  currentBoard: null,
  columns: [],
  cards: [],
  loading: false,

  fetchBoards: async () => {
    set({ loading: true })
    const { data, error } = await supabase
      .from('boards').select('*').order('created_at', { ascending: true })
    if (error) console.error('fetchBoards:', error)
    set({ boards: data ?? [], loading: false })
  },

  fetchBoard: async (boardId) => {
    const { data } = await supabase.from('boards').select('*').eq('id', boardId).single()
    set({ currentBoard: data })
  },

  createBoard: async (title) => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('boards').insert({ title, user_id: user.id }).select().single()
    if (error) throw error
    set(s => ({ boards: [...s.boards, data] }))
    return data
  },

  updateBoardTitle: async (boardId, title) => {
    await supabase.from('boards').update({ title }).eq('id', boardId)
    set(s => ({
      boards: s.boards.map(b => b.id === boardId ? { ...b, title } : b),
      currentBoard: s.currentBoard?.id === boardId ? { ...s.currentBoard, title } : s.currentBoard,
    }))
  },

  deleteBoard: async (boardId) => {
    await supabase.from('boards').delete().eq('id', boardId)
    set(s => ({ boards: s.boards.filter(b => b.id !== boardId) }))
  },

  fetchColumns: async (boardId) => {
    const { data, error } = await supabase
      .from('columns').select('*').eq('board_id', boardId).order('position', { ascending: true })
    if (error) console.error('fetchColumns:', error)
    set({ columns: data ?? [] })
  },

  createColumn: async (boardId, title) => {
    const { columns } = get()
    const maxPos = columns.reduce((m, c) => Math.max(m, c.position), 0)
    const { data, error } = await supabase
      .from('columns').insert({ board_id: boardId, title, position: maxPos + 1000 }).select().single()
    if (error) throw error
    set(s => ({ columns: [...s.columns, data] }))
  },

  updateColumnTitle: async (columnId, title) => {
    await supabase.from('columns').update({ title }).eq('id', columnId)
    set(s => ({ columns: s.columns.map(c => c.id === columnId ? { ...c, title } : c) }))
  },

  deleteColumn: async (columnId) => {
    await supabase.from('columns').delete().eq('id', columnId)
    set(s => ({
      columns: s.columns.filter(c => c.id !== columnId),
      cards: s.cards.filter(c => c.column_id !== columnId),
    }))
  },

  reorderColumns: async (newColumns) => {
    set({ columns: newColumns })
    const updates = newColumns.map(c => ({ id: c.id, position: c.position }))
    await supabase.from('columns').upsert(updates)
  },

  fetchCards: async (boardId) => {
    const { data, error } = await supabase
      .from('cards').select('*').eq('board_id', boardId).order('position', { ascending: true })
    if (error) console.error('fetchCards:', error)
    set({ cards: data ?? [] })
  },

  createCard: async (boardId, columnId, title) => {
    const { cards } = get()
    const colCards = cards.filter(c => c.column_id === columnId)
    const maxPos = colCards.reduce((m, c) => Math.max(m, c.position), 0)
    const { data, error } = await supabase
      .from('cards').insert({ board_id: boardId, column_id: columnId, title, position: maxPos + 1000 }).select().single()
    if (error) throw error
    set(s => ({ cards: [...s.cards, data] }))
  },

  updateCard: async (cardId, updates) => {
    await supabase.from('cards').update(updates).eq('id', cardId)
    set(s => ({ cards: s.cards.map(c => c.id === cardId ? { ...c, ...updates } : c) }))
  },

  deleteCard: async (cardId) => {
    await supabase.from('cards').delete().eq('id', cardId)
    set(s => ({ cards: s.cards.filter(c => c.id !== cardId) }))
  },

  moveCard: async (cardId, newColumnId, newPosition) => {
    set(s => ({
      cards: s.cards.map(c =>
        c.id === cardId ? { ...c, column_id: newColumnId, position: newPosition } : c
      )
    }))
    await supabase.from('cards').update({ column_id: newColumnId, position: newPosition }).eq('id', cardId)
  },
}))
