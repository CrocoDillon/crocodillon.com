import Image, { type StaticImageData } from 'next/image'

export function ArticleImage({
  src,
  darkSrc,
  alt,
}: {
  src: StaticImageData
  darkSrc?: StaticImageData
  alt: string
}) {
  const shared = {
    placeholder: 'blur' as const,
    quality: 90,
    sizes:
      '(max-width: 639px) calc(100vw - 48px), (max-width: 848px) calc(100vw - 80px), 768px',
    style: { width: '100%', height: 'auto' },
  }

  return (
    <>
      <Image
        {...shared}
        src={src}
        alt={alt}
        className={darkSrc ? 'rounded-sm dark:hidden' : 'rounded-sm'}
      />
      {darkSrc && (
        <Image
          {...shared}
          src={darkSrc}
          alt={alt}
          className="hidden rounded-sm dark:inline"
        />
      )}
    </>
  )
}
