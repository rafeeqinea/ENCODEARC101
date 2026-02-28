import { Inbox } from 'lucide-react'

export default function EmptyState({ title = 'No data yet', description = '' }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="relative w-16 h-16 mb-4">
                <div className="absolute inset-0 rounded-2xl hatched-subtle" />
                <div className="relative w-full h-full rounded-2xl border border-[var(--color-border)] flex items-center justify-center bg-[var(--color-surface)]">
                    <Inbox className="w-6 h-6 text-[var(--color-text-muted)]" />
                </div>
            </div>
            <p className="text-sm font-medium text-[var(--color-text-secondary)]">{title}</p>
            {description && <p className="text-xs text-[var(--color-text-muted)] mt-1">{description}</p>}
        </div>
    )
}
