'use client'

import { Suspense } from 'react'
import SigninPageContent from './SigninPageContent'

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-lg">Loading sign-in...</div>}>
      <SigninPageContent />
    </Suspense>
  )
}
