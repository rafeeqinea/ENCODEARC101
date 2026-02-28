export default function StatusBadge({ status }) {
    const isPending = status === 'pending'
    return (
        <span className={`badge ${isPending ? 'badge-warning' : 'badge-success'} text-[0.75rem]`}>
            {status}
        </span>
    )
}
