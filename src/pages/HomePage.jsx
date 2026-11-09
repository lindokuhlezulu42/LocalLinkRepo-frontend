import { useState } from 'react'
import { ArrowRight, Check, ChevronDown, ChevronRight, MapPin, Search, ShieldCheck } from 'lucide-react'
import { CATEGORIES } from '../data/categories.js'
import { AppLink } from '../components/common/AppLink.jsx'
import { CategoryIcon } from '../components/common/CategoryIcon.jsx'
import { ProviderCard } from '../components/common/ProviderCard.jsx'
import { Step } from '../components/home/Step.jsx'

export function HomePage({ providers, navigate }) {
  const [category, setCategory] = useState('')
  const [area, setArea] = useState('')
  const featured = providers.slice(0, 3)

  const search = (event) => {
    event.preventDefault()
    const query = new URLSearchParams()
    if (category) query.set('category', category)
    if (area.trim()) query.set('area', area.trim())
    navigate(`/browse${query.size ? `?${query}` : ''}`)
  }

  return (
    <main>
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-copy">
            <div className="eyebrow eyebrow-glass"><ShieldCheck size={14} /> Community services directory</div>
            <h1>Find someone you can actually trust.</h1>
            <p>Plumbers, electricians, mechanics and tutors who work in your area — with real contact details, indicative prices and profiles reviewed before they go live.</p>
            <form className="hero-search" onSubmit={search}>
              <label className="hero-select">
                <Search size={20} />
                <span className="sr-only">Service category</span>
                <select value={category} onChange={(event) => setCategory(event.target.value)}>
                  <option value="">All services</option>
                  {CATEGORIES.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}
                </select>
                <ChevronDown size={16} />
              </label>
              <label className="hero-area">
                <MapPin size={20} />
                <span className="sr-only">Your suburb or area</span>
                <input value={area} onChange={(event) => setArea(event.target.value)} placeholder="Your suburb or area" />
              </label>
              <button className="button button-primary search-button" type="submit">Search <ArrowRight size={16} /></button>
            </form>
            <div className="hero-footnote"><Check size={15} /> Free for residents · No account needed to browse</div>
          </div>
        </div>
      </section>

      <section className="section category-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Service spectrum</p>
            <h2>Browse the trades people actually need</h2>
          </div>
          <AppLink to="/browse" navigate={navigate} className="text-link">See all providers <ArrowRight size={17} /></AppLink>
        </div>
        <div className="category-grid">
          {CATEGORIES.map(({ name, description, color }) => (
            <AppLink key={name} to={`/browse?category=${encodeURIComponent(name)}`} navigate={navigate} className="category-card">
              <span className={`category-icon ${color}`}><CategoryIcon name={name} size={22} /></span>
              <span className="category-card-copy"><strong>{name}</strong><span>{description}</span></span>
              <ChevronRight className="category-arrow" size={18} />
            </AppLink>
          ))}
        </div>
      </section>

      <section className="section providers-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Recently verified</p>
            <h2>Local pros, ready to help</h2>
            <p className="section-subtitle">Each profile is checked for real contact details and clear pricing before it appears here.</p>
          </div>
          <AppLink to="/browse" navigate={navigate} className="text-link">Browse all providers <ArrowRight size={17} /></AppLink>
        </div>
        <div className="provider-grid">
          {featured.map((provider) => <ProviderCard key={provider.id} provider={provider} navigate={navigate} />)}
        </div>
      </section>

      <section className="how-section" id="how-it-works">
        <div className="section how-inner">
          <div className="how-intro">
            <p className="eyebrow">Simple by design</p>
            <h2>Good help is closer than you think.</h2>
            <p>Finding a reliable local service should feel straightforward. Compare clear profiles, then get in touch directly.</p>
            <AppLink to="/browse" navigate={navigate} className="button button-dark">Explore the directory <ArrowRight size={17} /></AppLink>
          </div>
          <div className="steps-grid">
            <Step number="01" title="Find a service" text="Choose a category and see local providers in your area." />
            <Step number="02" title="Compare profiles" text="Review services, indicative prices and verified contact details." />
            <Step number="03" title="Contact directly" text="Request a quote from the provider who feels right for your job." />
          </div>
        </div>
      </section>

      <section className="provider-cta" id="for-providers">
        <div className="provider-cta-inner">
          <div>
            <p className="eyebrow eyebrow-light">For local businesses</p>
            <h2>Good work deserves to be found.</h2>
            <p>Create a free listing and connect with people looking for the services you offer.</p>
          </div>
          <AppLink to="/register" navigate={navigate} className="button button-white">List your service <ArrowRight size={17} /></AppLink>
        </div>
      </section>
    </main>
  )
}
