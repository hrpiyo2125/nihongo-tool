import { headers } from 'next/headers';
import { getMaterials } from '@/lib/notion';
import MobileHome from './MobileHome';
import DesktopHome from './DesktopHome';

function isMobileUA(ua: string): boolean {
  return /iPhone|iPod|Android.*Mobile/i.test(ua);
}

export default async function Page() {
  const headersList = await headers();
  const ua = headersList.get('user-agent') ?? '';
  const isMobile = isMobileUA(ua);
  const materials = await getMaterials();

  if (isMobile) return <MobileHome materials={materials} />;
  return <DesktopHome materials={materials} />;
}
