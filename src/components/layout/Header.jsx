import { useState } from 'react'
import { LayoutDashboard, Menu, X } from '../../icons.js'
import { AppLink } from '../common/AppLink.jsx'

export function Header({ user, navigate, signOut }) {
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <header className="site-header">
      <div className="header-inner">
        <AppLink to="/" navigate={navigate} className="brand" aria-label="LocalLink home">
          <span className="brand-mark"><img src="/locallink-mark.png" alt="" /></span>
          <span>Local<span>Link</span></span>
        </AppLink>
        <button className="mobile-menu-button" type="button" aria-label="Toggle navigation" onClick={() => setMenuOpen((open) => !open)}>
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
        <nav className={`main-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Main navigation">
          <AppLink to="/browse" navigate={navigate} onClick={() => setMenuOpen(false)}>Browse services</AppLink>
          <AppLink to="/#how-it-works" navigate={navigate} onClick={() => setMenuOpen(false)}>How it works</AppLink>
          <AppLink to="/#for-providers" navigate={navigate} onClick={() => setMenuOpen(false)}>For providers</AppLink>
          {user ? (
            <div className="header-account">
              <AppLink to="/dashboard" navigate={navigate} className="button button-primary button-small">
                <LayoutDashboard size={16} /> Dashboard
              </AppLink>
              <button type="button" className="text-button" onClick={signOut}>Sign out</button>
            </div>
          ) : (
            <div className="header-account">
              <AppLink to="/login" navigate={navigate} className="text-button">Sign in</AppLink>
              <AppLink to="/register" navigate={navigate} className="button button-primary button-small">List your service</AppLink>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
