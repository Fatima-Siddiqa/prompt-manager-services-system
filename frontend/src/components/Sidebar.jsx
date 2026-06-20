import { NavLink } from 'react-router-dom'

export default function Sidebar() {
  return (
    <aside style={{
      width: '220px',
      minHeight: '100vh',
      background: 'var(--dark-2)',
      borderRight: '1px solid var(--dark-4)',
      display: 'flex',
      flexDirection: 'column',
      padding: '32px 0',
      position: 'fixed',
      top: 0,
      left: 0,
    }}>
      <div style={{ padding: '0 24px 32px' }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '13px',
          color: 'var(--sage)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: '4px',
        }}>
          {'>'} prompt_mgr
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          ATS Internship — Week 1
        </div>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '0 12px' }}>
        {[
          { to: '/', label: 'Prompts', icon: '◈' },
          { to: '/reviews', label: 'Reviews', icon: '◎' },
        ].map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '9px 12px',
              borderRadius: 'var(--radius)',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500',
              color: isActive ? 'var(--dark)' : 'var(--text-secondary)',
              background: isActive ? 'var(--sage)' : 'transparent',
              transition: 'var(--transition)',
            })}
          >
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      <div style={{
        marginTop: 'auto',
        padding: '24px',
        fontSize: '11px',
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-mono)',
      }}>
        prompt-service :8000<br />
        review-service :8001
      </div>
    </aside>
  )
}