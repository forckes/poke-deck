import {
	getSendedTradeByReceiverIdAction,
	getTradeByReceiverIdAction,
	getTradeBySenderIdAction,
} from '@/lib/actions/trade.actions'
import { useQuery } from '@tanstack/react-query'

export const useAllTrades = () => {
	const {
		data: sentTrades,
		isLoading: isSentLoading,
		isLoading: isSentError,
	} = useQuery({
		queryKey: ['sent-trades'],
		queryFn: getTradeBySenderIdAction,
	})

	const {
		data: receivedTrades,
		isLoading: isReceivedLoading,
		isError: isReceivedError,
	} = useQuery({
		queryKey: ['received-trades'],
		queryFn: getTradeByReceiverIdAction,
	})

	const {
		data: newTrades,
		isLoading: isNewLoading,
		isError: isNewError,
	} = useQuery({
		queryKey: ['new-trades'],
		queryFn: getSendedTradeByReceiverIdAction,
	})

	return {
		state: { sentTrades, receivedTrades, newTrades },
		status: {
			isSentLoading,
			isSentError,
			isReceivedLoading,
			isReceivedError,
			isNewLoading,
			isNewError,
		},
	}
}
