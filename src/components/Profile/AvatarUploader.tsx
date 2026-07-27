'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useUploadThing } from '@/utils/uploadthing'
import { Loader2, Pencil } from 'lucide-react'

interface AvatarUploaderProps {
	currentImage?: string | null
	username?: string | null
	bannerColor?: string
}

export function AvatarUploader({
	currentImage,
	username,
	bannerColor,
}: AvatarUploaderProps) {
	const router = useRouter()
	const inputRef = useRef<HTMLInputElement>(null)
	const [previewUrl, setPreviewUrl] = useState(
		currentImage || '/profile/default_avatar.png',
	)

	const { startUpload, isUploading } = useUploadThing('profileImage', {
		onClientUploadComplete: res => {
			if (res?.[0]?.url) {
				setPreviewUrl(res[0].url)
				router.refresh()
			}
		},
		onUploadError: error => {
			alert(`Upload failed: ${error.message}`)
		},
	})

	return (
		<div className='flex flex-col items-center'>
			<label
				className='relative group cursor-pointer block rounded-full'
				onClick={() => inputRef.current?.click()}
			>
				<div
					style={
						{
							'--banner-color': bannerColor,
						} as React.CSSProperties
					}
					className={`absolute -inset-1 bg-linear-to-tr from-(--banner-color) to-[color-mix(in_srgb,var(--banner-color)_20%,transparent)] rounded-full blur-xl opacity-25 group-hover:opacity-90 transition duration-1000`}
				></div>

				<div
					style={
						{
							'--banner-color': bannerColor,
						} as React.CSSProperties
					}
					className={`relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-8 border-(--banner-color,#ffffff)`}
				>
					<Image
						src={previewUrl}
						alt={username || 'User Avatar'}
						fill
						sizes='(max-width: 768px) 128px, 160px'
						className='object-cover transition-opacity duration-300 group-hover:opacity-80'
					/>

					<div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10'>
						<Pencil className='w-8 h-8 text-white drop-shadow-md' />
					</div>

					{isUploading && (
						<div className='absolute inset-0 bg-black/60 flex items-center justify-center z-20'>
							<Loader2 className='w-8 h-8 animate-spin text-white' />
						</div>
					)}
				</div>

				<div className='absolute bottom-4 right-4 w-6 h-6 bg-green-500 border-4 border-card rounded-full shadow-lg'></div>

				<input
					ref={inputRef}
					type='file'
					accept='image/*'
					className='hidden'
					disabled={isUploading}
					onChange={async e => {
						const file = e.target.files?.[0]
						if (!file) return

						await startUpload([file])
						e.target.value = ''
					}}
				/>
			</label>
		</div>
	)
}
