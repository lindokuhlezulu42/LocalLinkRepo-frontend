import { BriefcaseBusiness } from 'lucide-react'
import { CATEGORIES } from '../../data/categories.js'

export function CategoryIcon({ name, size = 20 }) {
  const Icon = CATEGORIES.find((category) => category.name === name)?.icon ?? BriefcaseBusiness
  return <Icon size={size} strokeWidth={1.8} aria-hidden="true" />
}
