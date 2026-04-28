export default function Spinner({ size = 24 }) {
  return (
    <div style={{
      width: size, height: size,
      border: '3px solid #e0e4ff',
      borderTopColor: '#667eea',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }} />
  )
}
