const NotificationPing = () => {
	return (
		<span className='absolute -top-1 -right-1 flex h-3 w-3'>
			<span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/60 opacity-75'></span>
			<span className='relative inline-flex rounded-full h-3 w-3 bg-primary/80'></span>
		</span>
	)
}

export default NotificationPing
