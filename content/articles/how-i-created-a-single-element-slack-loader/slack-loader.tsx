'use client'

import { useState, useSyncExternalStore } from 'react'
import styles from './slack-loader.module.css'

type Stage = 'element' | 'pseudo' | 'shadows' | 'motion' | 'final'

const motionQuery = '(prefers-reduced-motion: reduce)'

function subscribeToMotionPreference(onChange: () => void) {
  const query = window.matchMedia(motionQuery)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

function getMotionPreference() {
  return window.matchMedia(motionQuery).matches
}

// Keep the server-rendered examples still until the browser preference is known.
function getServerMotionPreference() {
  return true
}

export function SlackLoader({
  stage,
  caption,
}: {
  stage: Stage
  caption: string
}) {
  const reducedMotion = useSyncExternalStore(
    subscribeToMotionPreference,
    getMotionPreference,
    getServerMotionPreference
  )
  const [pauseOverride, setPauseOverride] = useState<boolean | null>(null)
  const paused = pauseOverride ?? reducedMotion
  const animated = stage === 'motion' || stage === 'final'

  return (
    <figure className={`not-prose ${styles.example}`}>
      {animated && (
        <div className={styles.controls}>
          <button
            type="button"
            aria-label={paused ? 'Play animation' : 'Pause animation'}
            title={paused ? 'Play animation' : 'Pause animation'}
            onClick={() => setPauseOverride(!paused)}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              {paused ? (
                <path d="m8 5 11 7-11 7z" />
              ) : (
                <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
              )}
            </svg>
          </button>
        </div>
      )}
      <div className={styles.canvas} aria-hidden="true">
        <div
          className={styles.loader}
          data-stage={stage}
          data-paused={paused}
        />
      </div>
      <figcaption>{caption}</figcaption>
    </figure>
  )
}
