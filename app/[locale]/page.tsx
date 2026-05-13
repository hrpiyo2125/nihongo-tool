import { headers } from 'next/headers';
import { getMaterialsWithPageCount } from '@/lib/materials';
import MobileHome from './MobileHome';
import DesktopHome from './DesktopHome';

function isMobileUA(ua: string): boolean {
  return /iPhone|iPod|Android.*Mobile/i.test(ua);
}

export default async function Page() {
  const headersList = await headers();
  const ua = headersList.get('user-agent') ?? '';
  const isMobile = isMobileUA(ua);
  const materials = await getMaterialsWithPageCount();

  if (isMobile) return <MobileHome materials={materials} />;
  return <DesktopHome materials={materials} />;
}
