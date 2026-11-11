import { CarFront, GraduationCap, House, Sparkles, Wrench, Zap } from '../icons.js'

export const CATEGORIES = [
  { name: 'Plumbing', description: 'Leaks, geysers, blocked drains', icon: Wrench, color: 'violet' },
  { name: 'Electrical', description: 'Wiring, DB boards, fault finding', icon: Zap, color: 'amber' },
  { name: 'Mechanics', description: 'Services, brakes, diagnostics', icon: CarFront, color: 'blue' },
  { name: 'Tutoring', description: 'Maths, science, languages', icon: GraduationCap, color: 'green' },
  { name: 'Cleaning', description: 'Homes, offices, deep cleans', icon: Sparkles, color: 'pink' },
  { name: 'Building', description: 'Tiling, ceilings, renovations', icon: House, color: 'orange' },
  { name: 'Gardening', description: 'Lawns, trees, landscaping', icon: House, color: 'green' },
  { name: 'Beauty', description: 'Hair, nails, mobile stylists', icon: Sparkles, color: 'pink' },
]
