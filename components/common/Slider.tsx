'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface SliderProps {
  min: number
  max: number
  step?: number
  value: number | [number, number]
  onChange: (value: number | [number, number]) => void
  range?: boolean
}

export function Slider({ min, max, step = 1, value, onChange, range = false }: SliderProps) {
  const [values, setValues] = useState<[number, number]>(
    range ? (value as [number, number]) : [min, value as number]
  )
  const [dragging, setDragging] = useState<'min' | 'max' | null>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (range) {
      setValues(value as [number, number])
    } else {
      setValues([min, value as number])
    }
  }, [value, min, range])

  const getPercentage = useCallback((val: number) => {
    return ((val - min) / (max - min)) * 100
  }, [min, max])

  const getValueFromPosition = useCallback((position: number) => {
    const trackRect = trackRef.current?.getBoundingClientRect()
    if (!trackRect) return min
    
    const percentage = Math.max(0, Math.min(100, (position / trackRect.width) * 100))
    const rawValue = min + (percentage / 100) * (max - min)
    
    // Snap to step
    const steppedValue = Math.round(rawValue / step) * step
    return Math.max(min, Math.min(max, steppedValue))
  }, [min, max, step])

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!dragging || !trackRef.current) return
    
    const trackRect = trackRef.current.getBoundingClientRect()
    const position = event.clientX - trackRect.left
    const newValue = getValueFromPosition(position)
    
    if (dragging === 'min' && range) {
      const newValues: [number, number] = [Math.min(newValue, values[1] - step), values[1]]
      setValues(newValues)
      onChange(newValues)
    } else if (dragging === 'max') {
      const newValues: [number, number] = range 
        ? [values[0], Math.max(newValue, values[0] + step)]
        : [min, newValue]
      setValues(newValues)
      onChange(range ? newValues : newValue)
    }
  }, [dragging, getValueFromPosition, min, onChange, range, step, values])

  const handleMouseUp = useCallback(() => {
    setDragging(null)
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }, [handleMouseMove])

  const handleMouseDown = useCallback((event: React.MouseEvent, handle: 'min' | 'max') => {
    event.preventDefault()
    event.stopPropagation()
    setDragging(handle)
    
    // Add the event listeners
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [handleMouseMove, handleMouseUp])

  const handleTrackClick = useCallback((event: React.MouseEvent) => {
    if (!trackRef.current) return
    
    const trackRect = trackRef.current.getBoundingClientRect()
    const position = event.clientX - trackRect.left
    const newValue = getValueFromPosition(position)
    
    if (range) {
      // Determine which handle to move based on which is closer
      const minDistance = Math.abs(getPercentage(values[0]) - getPercentage(newValue))
      const maxDistance = Math.abs(getPercentage(values[1]) - getPercentage(newValue))
      
      if (minDistance <= maxDistance) {
        const newValues: [number, number] = [Math.min(newValue, values[1] - step), values[1]]
        setValues(newValues)
        onChange(newValues)
      } else {
        const newValues: [number, number] = [values[0], Math.max(newValue, values[0] + step)]
        setValues(newValues)
        onChange(newValues)
      }
    } else {
      const newValues: [number, number] = [min, newValue]
      setValues(newValues)
      onChange(newValue)
    }
  }, [getPercentage, getValueFromPosition, min, onChange, range, step, values])

  // Add touch support
  const handleTouchStart = useCallback((event: React.TouchEvent, handle: 'min' | 'max') => {
    event.preventDefault()
    setDragging(handle)
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd)
  }, [])

  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (!dragging || !trackRef.current || !event.touches[0]) return
    event.preventDefault()
    
    const trackRect = trackRef.current.getBoundingClientRect()
    const position = event.touches[0].clientX - trackRect.left
    const newValue = getValueFromPosition(position)
    
    if (dragging === 'min' && range) {
      const newValues: [number, number] = [Math.min(newValue, values[1] - step), values[1]]
      setValues(newValues)
      onChange(newValues)
    } else if (dragging === 'max') {
      const newValues: [number, number] = range 
        ? [values[0], Math.max(newValue, values[0] + step)]
        : [min, newValue]
      setValues(newValues)
      onChange(range ? newValues : newValue)
    }
  }, [dragging, getValueFromPosition, min, onChange, range, step, values])

  const handleTouchEnd = useCallback(() => {
    setDragging(null)
    document.removeEventListener('touchmove', handleTouchMove)
    document.removeEventListener('touchend', handleTouchEnd)
  }, [handleTouchMove])

  return (
    <div className="relative w-full h-6 flex items-center">
      <div 
        ref={trackRef}
        className="absolute w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer"
        onClick={handleTrackClick}
      >
        <div
          className="absolute h-full bg-purple-500 rounded-full"
          style={{
            left: `${getPercentage(values[0])}%`,
            width: `${getPercentage(values[1]) - getPercentage(values[0])}%`
          }}
        />
      </div>
      
      {range && (
        <div
          className="absolute w-5 h-5 bg-white dark:bg-gray-100 border-2 border-purple-500 rounded-full shadow-md cursor-grab active:cursor-grabbing"
          style={{ left: `calc(${getPercentage(values[0])}% - 10px)` }}
          onMouseDown={(e) => handleMouseDown(e, 'min')}
          onTouchStart={(e) => handleTouchStart(e, 'min')}
          role="slider"
          aria-valuemin={min}
          aria-valuemax={values[1]}
          aria-valuenow={values[0]}
          tabIndex={0}
        />
      )}
      
      <div
        className="absolute w-5 h-5 bg-white dark:bg-gray-100 border-2 border-purple-500 rounded-full shadow-md cursor-grab active:cursor-grabbing"
        style={{ left: `calc(${getPercentage(values[1])}% - 10px)` }}
        onMouseDown={(e) => handleMouseDown(e, 'max')}
        onTouchStart={(e) => handleTouchStart(e, 'max')}
        role="slider"
        aria-valuemin={range ? values[0] : min}
        aria-valuemax={max}
        aria-valuenow={values[1]}
        tabIndex={0}
      />
    </div>
  )
}
