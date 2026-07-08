const StatCard = ({
	label,
	value,
	accentColor = 'border-border',
	textColor = 'text-foreground',
	className = '',
}: {
	label: string
	value: string | number
	accentColor?: string
	textColor?: string
	className?: string
}) => {
	return (
		<div
			className={`bg-background/50 p-5 rounded-2xl border border-border border-b-[6px] ${accentColor} flex flex-col items-center justify-center min-w-30 shadow-sm ${className}`}
		>
			<span className={`text-2xl md:text-3xl font-black ${textColor}`}>
				{value}
			</span>
			<span className='text-[10px] md:text-[11px] text-muted-foreground font-extrabold tracking-[0.2em] mt-1'>
				{label}
			</span>
		</div>
	)
}

export default StatCard
