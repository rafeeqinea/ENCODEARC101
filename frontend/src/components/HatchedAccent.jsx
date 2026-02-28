export default function HatchedAccent({ className = '', height = '6px' }) {
    return (
        <div
            className={`hatched-glow w-full rounded-full overflow-hidden ${className}`}
            style={{ height }}
        >
            <div className="w-full h-full hatched" />
        </div>
    )
}
