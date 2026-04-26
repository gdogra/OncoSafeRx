import React from 'react'
import { ServerOff } from 'lucide-react'

interface Props {
  /** Short feature name shown in the headline. e.g. "Genomics analysis" */
  feature: string
  /** Optional one-line context. Defaults to a frontend-only-deploy explanation. */
  reason?: string
  /** Wrapper styling — pass 'page' to fill the screen, 'card' to render inline. */
  variant?: 'page' | 'card'
}

/**
 * Stand-in panel for features that need a backend that isn't deployed
 * in the current shape (frontend-only Netlify build). Shown instead of
 * silently-failing fetch errors so users know the screen is meant to be
 * empty, not broken.
 */
const FeatureUnavailable: React.FC<Props> = ({
  feature,
  reason = 'This feature requires the backend service, which isn\'t deployed in the current build. Core clinical workflows (drug search, interactions, recommendations, trials) all work without it.',
  variant = 'page',
}) => {
  const wrapper = variant === 'page'
    ? 'min-h-[60vh] flex items-center justify-center px-4'
    : 'p-6'

  return (
    <div className={wrapper}>
      <div className="max-w-md w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-amber-50 dark:bg-amber-900/20 mb-3">
          <ServerOff className="h-6 w-6 text-amber-600 dark:text-amber-400" />
        </div>
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1.5">
          {feature} is not available
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          {reason}
        </p>
      </div>
    </div>
  )
}

export default FeatureUnavailable
