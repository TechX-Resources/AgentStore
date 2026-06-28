import { useState } from 'react'

interface Props {
  rating: number
  interactive?: boolean
  onChange?: (rating: number) => void
  size?: number
}

export default function StarRating({ rating, interactive = false, onChange, size = 18 }: Props) {
  const [hoverRating, setHoverRating] = useState<number | null>(null)

  const activeRating = hoverRating !== null ? hoverRating : rating

  const handleMouseEnter = (index: number) => {
    if (interactive) setHoverRating(index)
  }

  const handleMouseLeave = () => {
    if (interactive) setHoverRating(null)
  }

  const handleClick = (index: number) => {
    if (interactive && onChange) {
      onChange(index)
    }
  }

  const renderStar = (index: number) => {
    // Determine fill percentage
    let fill = 0
    if (activeRating >= index) {
      fill = 100
    } else if (activeRating > index - 1) {
      fill = (activeRating - (index - 1)) * 100
    }

    const starId = `star-grad-${index}-${fill}`

    return (
      <svg
        key={index}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        style={{
          cursor: interactive ? 'pointer' : 'default',
          transition: 'transform 0.15s ease',
          transform: interactive && hoverRating !== null && hoverRating >= index ? 'scale(1.2)' : 'scale(1)',
        }}
        onMouseEnter={() => handleMouseEnter(index)}
        onMouseLeave={handleMouseLeave}
        onClick={() => handleClick(index)}
      >
        <defs>
          <linearGradient id={starId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset={`${fill}%`} stopColor="#f59e0b" />
            <stop offset={`${fill}%`} stopColor="rgba(255, 255, 255, 0.15)" />
          </linearGradient>
        </defs>
        <path
          d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
          fill={`url(#${starId})`}
          stroke={activeRating >= index - 0.5 ? '#f59e0b' : 'rgba(255, 255, 255, 0.2)'}
          strokeWidth="1"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  return (
    <div style={{ display: 'inline-flex', gap: '2px', alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map((i) => renderStar(i))}
    </div>
  )
}
