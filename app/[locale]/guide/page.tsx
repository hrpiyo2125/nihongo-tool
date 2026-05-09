import { getGuideBlocks, type NotionBlock } from '@/lib/notion';
import { HowtoContent } from '../LegalPagesContent';

export default async function GuidePage() {
  let blocks: NotionBlock[] = [];
  try {
    blocks = await getGuideBlocks();
  } catch {
    // fallback to empty
  }
  return <HowtoContent onBack={() => {}} blocks={blocks} />;
}
