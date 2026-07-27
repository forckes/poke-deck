import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	reactCompiler: true,
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'raw.githubusercontent.com',
			},
			{
				protocol: 'https',
				hostname: 'utfs.io',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: 'ufs.sh',
				pathname: '/**',
			},
		],
	},
}

export default nextConfig
