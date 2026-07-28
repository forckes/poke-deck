export function getContrastingColor(
	hexColor?: string,
): 'text-slate-950' | 'text-white' {
	if (!hexColor) return 'text-white'

	const hex = hexColor.replace('#', '')

	const r = parseInt(hex.substring(0, 2), 16) || 0
	const g = parseInt(hex.substring(2, 4), 16) || 0
	const b = parseInt(hex.substring(4, 6), 16) || 0

	const brightness = (r * 299 + g * 587 + b * 114) / 1000

	return brightness > 220 ? 'text-slate-950' : 'text-white'
}
