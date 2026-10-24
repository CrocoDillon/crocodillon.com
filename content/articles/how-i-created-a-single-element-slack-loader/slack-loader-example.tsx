'use client'

import { useState, useSyncExternalStore } from 'react'
import styles from './slack-loader-example.module.css'

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

export function SlackLoaderExample({
  stage,
  caption,
}: {
  stage: Stage
  caption: string
}) {
  const [backgrounds, setBackgrounds] = useState(stage !== 'final')
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
      <div className={styles.controls}>
        <button
          type="button"
          aria-pressed={backgrounds}
          onClick={() => setBackgrounds(value => !value)}
        >
          Show element backgrounds
        </button>
        {animated && (
          <button type="button" onClick={() => setPauseOverride(!paused)}>
            {paused ? 'Play animation' : 'Pause animation'}
          </button>
        )}
      </div>
      <div className={styles.canvas} aria-hidden="true">
        <div
          className={styles.loader}
          data-stage={stage}
          data-backgrounds={backgrounds}
          data-paused={paused}
        />
      </div>
      <figcaption>{caption}</figcaption>
    </figure>
  )
}
