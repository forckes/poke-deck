'use client'

import Link from 'next/link'
import TextPressure from '../TextPressure'
import { motion } from 'framer-motion'

const TextExpression = () => {
	return (
		<div className='flex flex-col items-center justify-center gap-10'>
			<motion.div
				initial={{ opacity: 0, y: 120 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true, amount: 0.5 }}
				transition={{ duration: 1, ease: 'easeOut' }}
				className='flex flex-col items-center justify-center gap-10 w-full'
			>
				<Link
					href='/deck'
					className='w-full flex flex-col items-center gap-10 no-underline'
				>
					<TextPressure
						text='Play!'
						flex
						alpha={false}
						stroke
						width
						weight
						italic
						textColor='#5227FF'
						strokeColor='#A855F7'
						minFontSize={36}
					/>
					<TextPressure
						text='Poke deck'
						flex
						alpha={false}
						stroke
						width
						weight
						italic={false}
						textColor='#5227FF'
						strokeColor='#A855F7'
						minFontSize={36}
					/>
				</Link>
			</motion.div>
		</div>
	)
}

export default TextExpression
