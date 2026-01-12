'use client'

import { Suspense } from 'react'
import SignupPageContent from './SignupPageContent'

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-lg">Loading signup...</div>}>
      <SignupPageContent />
    </Suspense>
  )
}
