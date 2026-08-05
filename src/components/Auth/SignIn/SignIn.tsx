import { Button } from '@/components/ui/button'
import { useSignIn } from './hooks/useSignIn'
import { Input } from '@/components/ui/input'
import { Turnstile } from '@marsidev/react-turnstile'
import { Loader2 } from 'lucide-react'
import { isE2E } from '@/utils/isE2E'

const SignIn = () => {
	const { state, functions } = useSignIn()

	return (
		<div className='w-full bg-black/40 backdrop-blur-md p-8 rounded-2xl border border-neutral-800 shadow-2xl'>
			<h1 className='text-3xl font-extrabold tracking-tight mb-6 text-center'>
				Sign In
			</h1>

			{state.error && (
				<p className='text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-md mb-4 text-center'>
					{state.error}
				</p>
			)}

			<form onSubmit={functions.handleSubmit} className='space-y-4'>
				<div className='space-y-1'>
					<Input
						name='identifier'
						type='text'
						placeholder='Email or Username'
						required
						autoComplete='username'
						className='border-neutral-700 placeholder:text-neutral-400 focus:outline-none focus:border-primary/50 h-11 placeholder:text-[16px]'
					/>
				</div>

				<div className='space-y-1'>
					<Input
						name='password'
						type='password'
						placeholder='Password'
						required
						autoComplete='current-password'
						className='border-neutral-700 placeholder:text-neutral-400 focus:outline-none focus:border-primary/50 h-11 placeholder:text-[16px]'
					/>
				</div>
				<div className='my-2 flex justify-center w-full'>
					{!isE2E && (
						<Turnstile
							siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
							onSuccess={token => functions.setTurnstileToken(token)}
							onExpire={() => functions.setTurnstileToken(null)}
							onError={() =>
								functions.setError('CAPTCHA Error, try to reload page.')
							}
							options={{
								theme: 'dark',
								size: 'flexible',
							}}
						/>
					)}
				</div>

				<Button className={`w-full ${state.isLoading && 'opacity-80'}`}>
					Sign In {state.isLoading && <Loader2 className='animate-spin' />}
				</Button>
			</form>
		</div>
	)
}

export default SignIn
