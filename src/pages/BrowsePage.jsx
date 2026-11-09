import { useEffect, useState } from 'react'
import { MapPin, Search, X } from 'lucide-react'
import { CATEGORIES } from '../data/categories.js'
import { ProviderCard } from '../components/common/ProviderCard.jsx'
import { apiGet } from '../lib/api.js'

export function BrowsePage({ params, navigate }) {
  const [category, setCategory] = useState(params.get('category') || '')
  const [area, setArea] = useState(params.get('area') || '')
  const [search, setSearch] = useState(params.get('q') || '')
  const [appliedArea, setAppliedArea] = useState(params.get('area') || '')
  const [available, setAvailable] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const query = new URLSearchParams()
    if (category) query.set('category', category)
    if (appliedArea.trim()) query.set('area', appliedArea.trim())
    if (search.trim()) query.set('q', search.trim())

    apiGet(`/api/providers${query.size ? `?${query}` : ''}`)
      .then((results) => {
        if (active) setAvailable(results)
      })
      .catch((requestError) => {
        if (active) setError(requestError.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [category, appliedArea, search])

  const applyFilter = (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setAppliedArea(area)
  }
  const updateQuery = (update) => {
    setLoading(true)
    setError('')
    update()
  }

  return (
    <main className="browse-page">
      <section className="browse-intro">
        <div className="browse-intro-inner">
          <p className="eyebrow">Directory</p>
          <h1>{category ? `${category} services` : 'All services'}</h1>
          <p>Every provider below has been reviewed before appearing here. Compare what they offer, then contact them directly.</p>
          <form className="area-filter" onSubmit={applyFilter}>
            <label className="area-input">
              <MapPin size={18} />
              <span className="sr-only">Filter by suburb or area</span>
              <input value={area} onChange={(event) => setArea(event.target.value)} placeholder="Filter by suburb or area" />
              {area && <button type="button" aria-label="Clear area" onClick={() => updateQuery(() => { setArea(''); setAppliedArea('') })}><X size={16} /></button>}
            </label>
            <button type="submit" className="button button-primary">Filter</button>
          </form>
        </div>
      </section>
      <section className="browse-results">
        <div className="browse-results-inner">
          <div className="filter-toolbar">
            <span className="filter-label"><Search size={15} /> Service</span>
            <div className="category-pills">
              <button type="button" className={`pill ${!category ? 'active' : ''}`} onClick={() => updateQuery(() => setCategory(''))}>All</button>
              {CATEGORIES.map((item) => (
                <button key={item.name} type="button" className={`pill ${category === item.name ? 'active' : ''}`} onClick={() => updateQuery(() => setCategory(item.name))}>{item.name}</button>
              ))}
            </div>
            {category && <button type="button" className="clear-filter" onClick={() => updateQuery(() => setCategory(''))}>Clear category <X size={14} /></button>}
          </div>
          <div className="results-topline">
            <p><strong>{available.length}</strong> {available.length === 1 ? 'provider' : 'providers'} found</p>
            <label className="search-results">
              <Search size={15} />
              <span className="sr-only">Search providers</span>
              <input value={search} onChange={(event) => updateQuery(() => setSearch(event.target.value))} placeholder="Search providers" />
            </label>
          </div>
          {available.length ? (
            <div className="provider-grid browse-grid">
              {available.map((provider) => <ProviderCard key={provider.id} provider={provider} navigate={navigate} />)}
            </div>
          ) : loading ? (
            <div className="page-loading"><span className="spinner" /> Searching providers…</div>
          ) : error ? (
            <div className="empty-state"><span className="empty-icon"><X size={22} /></span><h2>Search is unavailable</h2><p>{error}</p></div>
          ) : (
            <div className="empty-state">
              <span className="empty-icon"><Search size={22} /></span>
              <h2>No providers match that search yet</h2>
              <p>Try a different area or clear some filters. LocalLink is growing every day.</p>
              <button type="button" className="button button-secondary" onClick={() => updateQuery(() => { setCategory(''); setArea(''); setAppliedArea(''); setSearch('') })}>Clear filters</button>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
