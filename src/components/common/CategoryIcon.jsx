import { BriefcaseBusiness } from '../../icons.js'
import { CATEGORIES } from '../../data/categories.js'

export function CategoryIcon({ name, size = 20 }) {
  const Icon = CATEGORIES.find((category) => category.name === name)?.icon ?? BriefcaseBusiness
  return <Icon size={size} aria-hidden="true" />
}
