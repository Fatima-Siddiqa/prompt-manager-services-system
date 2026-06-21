import Sidebar from './Sidebar'
import { Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main style={{
        marginLeft: '220px',
        flex: 1,
        minHeight: '100vh',
        padding: '40px 48px',
        maxWidth: '960px',
      }}>
        <Outlet />
      </main>
    </div>
  )
}