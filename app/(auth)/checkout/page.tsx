'use client'

import { Suspense } from 'react'
import CheckoutPageContent from './CheckoutPageContent'

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-lg">Loading checkout...</div>}>
      <CheckoutPageContent />
    </Suspense>
  )
}
