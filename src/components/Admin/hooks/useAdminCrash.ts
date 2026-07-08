import { useState, useEffect } from 'react'
import { getCrashGameEngineStatusAction, toggleCrashGameAction } from '@/lib/actions/admin.actions'
import { toast } from 'sonner'

export const useAdminCrash = () => {
	const [isRunning, setIsRunning] = useState(false)
	const [isLoading, setIsLoading] = useState(true)
	const [isToggling, setIsToggling] = useState(false)

	const checkStatus = async () => {
		try {
			const res = await getCrashGameEngineStatusAction()
			setIsRunning(res.isRunning)
		} catch (error) {
			console.error(error)
		} finally {
			setIsLoading(false)
		}
	}

	useEffect(() => {
		checkStatus()
		const timer = setInterval(() => {
			checkStatus()
		}, 2000)
		return () => clearInterval(timer)
	}, [])

	const handleToggleEngine = async () => {
		setIsToggling(true)
		const action = isRunning ? 'stop' : 'start'
		try {
			const res = await toggleCrashGameAction(action)
			if (res.success) {
				const nextState = !isRunning
				setIsRunning(nextState)
				toast.success(
					nextState
						? 'Crash Game Engine started successfully'
						: 'Crash Game Engine stop signal sent. It will stop after the current round.'
				)
			}
		} catch (error: any) {
			toast.error(error.message || 'Failed to toggle Crash Game Engine')
		} finally {
			setIsToggling(false)
		}
	}

	return {
		state: {
			isRunning,
			isToggling,
		},
		status: {
			isLoading,
		},
		functions: {
			handleToggleEngine,
		},
	}
}
