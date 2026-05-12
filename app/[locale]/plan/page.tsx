import { headers } from 'next/headers'
import { getMaterials } from '@/lib/notion'
import DesktopHome from '../DesktopHome'
import MobileHome from '../MobileHome'

function isMobileUA(ua: string) {
  return /iPhone|iPod|Android.*Mobile/i.test(ua)
}

export default async function PlanPage() {
  const headersList = await headers()
  const ua = headersList.get('user-agent') ?? ''
  const isMobile = isMobileUA(ua)
  const materials = await getMaterials()

  if (isMobile) return <MobileHome materials={materials} initialPage="plan" />
  return <DesktopHome materials={materials} initialPage="plan" />
}
