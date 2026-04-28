import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useBoardStore } from '../store/boardStore'

export default function BoardsPage() {
  const { user, signOut } = useAuthStore()
  const { boards, fetchBoards, createBoard } = useBoardStore()
  const [title, setTitle] = useState('')
  const [creating, setCreating] = useState(false)
  const [showInput, setShowInput] = useState(false)
  const navigate = useNavigate()

  useEffect(() => { fetchBoards() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    setCreating(true)
    try {
      const board = await createBoard(title.trim())
      setTitle('')
      setShowInput(false)
      navigate(`/board/${board.id}`)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9ff' }}>
      {/* Navbar */}
      <div style={{
        background: 'white',
        borderBottom: '1px solid #eee',
        padding: '0 32px',
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            borderRadius: '9px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="5" height="5" rx="0.5"/>
              <rect x="9" y="2" width="5" height="5" rx="0.5"/>
              <rect x="2" y="9" width="5" height="5" rx="0.5"/>
              <rect x="9" y="9" width="5" height="5" rx="0.5"/>
            </svg>
          </div>
          <span style={{ fontWeight: '700', fontSize: '16px', color: '#1a1a2e' }}>TaskFlow</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '13px', color: '#888' }}>{user?.email}</span>
          <button
            onClick={signOut}
            style={{
              background: 'none', border: '1px solid #e0e0e0',
              borderRadius: '8px', padding: '6px 14px',
              fontSize: '13px', color: '#666', cursor: 'pointer',
            }}
          >
            Çıkış
          </button>
        </div>
      </div>

      {/* İçerik */}
      <div style={{ padding: '40px 32px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: '#1a1a2e' }}>Board'larım</h1>
          <button
            onClick={() => setShowInput(true)}
            style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white', border: 'none', borderRadius: '10px',
              padding: '10px 20px', fontSize: '14px', fontWeight: '600',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
            }}
          >
            + Yeni Board
          </button>
        </div>

        {/* Yeni board formu */}
        {showInput && (
          <form onSubmit={handleCreate} style={{
            background: 'white', borderRadius: '14px',
            padding: '20px', marginBottom: '20px',
            border: '1px solid #eee',
            display: 'flex', gap: '10px', alignItems: 'center',
          }}>
            <input
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Board adı..."
              style={{
                flex: 1, border: '1.5px solid #e0e0e0', borderRadius: '8px',
                padding: '9px 14px', fontSize: '14px', outline: 'none',
              }}
              onFocus={e => e.target.style.borderColor = '#667eea'}
              onBlur={e => e.target.style.borderColor = '#e0e0e0'}
            />
            <button
              type="submit"
              disabled={creating}
              style={{
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white', border: 'none', borderRadius: '8px',
                padding: '9px 20px', fontSize: '14px', fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              {creating ? 'Oluşturuluyor...' : 'Oluştur'}
            </button>
            <button
              type="button"
              onClick={() => { setShowInput(false); setTitle('') }}
              style={{
                background: 'none', border: '1px solid #e0e0e0',
                borderRadius: '8px', padding: '9px 14px',
                fontSize: '14px', color: '#888', cursor: 'pointer',
              }}
            >
              İptal
            </button>
          </form>
        )}

        {/* Board listesi */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '16px',
        }}>
          {boards.map(board => (
            <div
              key={board.id}
              onClick={() => navigate(`/board/${board.id}`)}
              style={{
                background: 'linear-gradient(135deg, #667eea22, #764ba222)',
                border: '1px solid #667eea33',
                borderRadius: '14px',
                padding: '24px 20px',
                cursor: 'pointer',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(102,126,234,0.15)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div style={{
                width: '36px', height: '36px',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                borderRadius: '10px', marginBottom: '14px',
              }} />
              <div style={{ fontWeight: '600', fontSize: '15px', color: '#1a1a2e' }}>
                {board.title}
              </div>
              <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
                Board'u aç →
              </div>
            </div>
          ))}

          {boards.length === 0 && !showInput && (
            <div style={{
              gridColumn: '1/-1', textAlign: 'center',
              padding: '60px 20px', color: '#aaa', fontSize: '14px',
            }}>
              Henüz board yok. "Yeni Board" ile başla!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
