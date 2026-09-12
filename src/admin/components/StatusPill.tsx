import type { ProjectStatus } from '@/types';

export default function StatusPill({ status }: { status: ProjectStatus }) {
  return (
    <span className={`badge badge--${status === 'published' ? 'published' : 'draft'}`}>
      {status === 'published' ? 'Published' : 'Draft'}
    </span>
  );
}
