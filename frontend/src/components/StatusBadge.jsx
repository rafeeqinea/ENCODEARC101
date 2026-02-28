import { Clock, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react'

export default function StatusBadge({ status }) {
    const s = (status || '').toLowerCase()

    let Icon = AlertCircle
    let colorClass = 'badge-info bg-[var(--color-info)]/10 text-[var(--color-info)]'

    if (s === 'pending') { Icon = Clock; colorClass = 'badge-warning bg-[var(--color-warning)]/10 text-[var(--color-warning)]' }
    else if (s === 'funded' || s === 'paid' || s === 'completed' || s === 'success') { Icon = CheckCircle2; colorClass = 'badge-success bg-[var(--color-success)]/10 text-[var(--color-success)]' }
    else if (s === 'overdue' || s === 'failed') { Icon = AlertTriangle; colorClass = 'badge-danger bg-[var(--color-danger)]/10 text-[var(--color-danger)]' }

    return (
        <span className={`px-2 py-0.5 rounded-md font-semibold ${colorClass} text-[0.65rem] uppercase tracking-wider flex items-center gap-1 w-fit`}>
            <Icon className="w-3 h-3" />
            {status}
        </span>
    )
}
