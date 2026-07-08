import { Input } from '@/components/ui/input'
import { useSignUp } from './hooks/useSignUp'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Turnstile } from '@marsidev/react-turnstile'

const SignUp = () => {
	const { state, functions } = useSignUp()

	return (
		<div className='w-full bg-black/40 backdrop-blur-md p-8 rounded-2xl border border-neutral-800 shadow-2xl'>
			<h1 className='text-3xl font-extrabold tracking-tight mb-6 text-center'>
				Sign Up
			</h1>

			{state.error && (
				<p className='text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-md mb-4 text-center'>
					{state.error}
				</p>
			)}

			<form onSubmit={functions.handleSubmit} className='space-y-4'>
				<div className='space-y-1'>
					<Input
						name='name'
						placeholder='Display Name'
						required
						className='border-neutral-700 placeholder:text-neutral-400 focus:outline-none focus:border-primary/50 h-11 placeholder:text-[16px]'
					/>
				</div>
				<div className='space-y-1'>
					<Input
						name='username'
						type='username'
						placeholder='Username'
						required
						className='border-neutral-700 placeholder:text-neutral-400 focus:outline-none focus:border-primary/50 h-11 placeholder:text-[16px]'
					/>
				</div>
				<div className='space-y-1'>
					<Input
						name='email'
						type='email'
						required
						placeholder='Email'
						className='border-neutral-700 placeholder:text-neutral-400 focus:outline-none focus:border-primary/50 h-11 placeholder:text-[16px]'
					/>
				</div>
				<div className='space-y-1'>
					<Input
						name='password'
						type='password'
						placeholder='Password'
						required
						minLength={8}
						className='border-neutral-700 placeholder:text-neutral-400 focus:outline-none focus:border-primary/50 h-11 placeholder:text-[16px]'
					/>
				</div>
				<div className='my-2 flex justify-center w-full'>
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
				</div>

				<Button className='w-full'>Sign Up</Button>
			</form>

			<p className='flex justify-center gap-2 items-center mt-4'>
				Already have an account?{' '}
				<Link className='text-primary hover:underline' href='/sign-in'>
					Log in
				</Link>
			</p>
		</div>
	)
}

export default SignUp
