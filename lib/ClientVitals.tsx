'use client'
import { useEffect } from 'react'

export default function ClientVitals() {
  useEffect(() => {
    import('web-vitals').then(({ onCLS, onINP, onLCP, onFCP, onTTFB }) => {
      import('./reportWebVitals').then(({ reportWebVitals }) => {
        onCLS(reportWebVitals)
        onINP(reportWebVitals)
        onLCP(reportWebVitals)
        onFCP(reportWebVitals)
        onTTFB(reportWebVitals)
        console.log('web-vitals 注册完成')
      })
    })
  }, [])
  return null
}
