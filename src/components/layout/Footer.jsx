import { AppLink } from '../common/AppLink.jsx'
import { CURRENT_YEAR } from '../../data/storage.js'

export function Footer({ navigate, isHome }) {
  return (
    <footer className={`site-footer${isHome ? '' : ' site-footer-dark'}`}>
      <div className="footer-main">
        <div className="footer-about">
          <AppLink to="/" navigate={navigate} className="brand brand-footer"><span className="brand-mark"><img src="/locallink-mark.png" alt="" /></span><span>Local<span>Link</span></span></AppLink>
          <p>A community services directory connecting residents with local trades, tutors and small businesses they can actually trust.</p>
        </div>
        <div><h3>Services</h3><AppLink to="/browse?category=Plumbing" navigate={navigate}>Plumbers</AppLink><AppLink to="/browse?category=Electrical" navigate={navigate}>Electricians</AppLink><AppLink to="/browse?category=Mechanics" navigate={navigate}>Mechanics</AppLink><AppLink to="/browse?category=Tutoring" navigate={navigate}>Tutors</AppLink></div>
        <div><h3>For providers</h3><AppLink to="/register" navigate={navigate}>Create an account</AppLink><AppLink to="/login" navigate={navigate}>Provider sign in</AppLink><AppLink to="/#for-providers" navigate={navigate}>How listings work</AppLink></div>
        <div><h3>Contact</h3><a href="mailto:hello@locallink.co.za">hello@locallink.co.za</a><AppLink to="/#for-providers" navigate={navigate}>List your service</AppLink></div>
      </div>
      <div className="footer-bottom"><p>© {CURRENT_YEAR} LocalLink. Built for the community.</p><p>Listings are reviewed before they are published.</p></div>
    </footer>
  )
}
