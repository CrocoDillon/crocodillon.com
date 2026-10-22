import Image, { type StaticImageData } from 'next/image'

export function ArticleImage({
  src,
  alt,
}: {
  src: StaticImageData
  alt: string
}) {
  return (
    <Image
      src={src}
      alt={alt}
      placeholder="blur"
      quality={90}
      sizes="(max-width: 639px) calc(100vw - 48px), (max-width: 848px) calc(100vw - 80px), 768px"
      className="rounded-sm"
      style={{ width: '100%', height: 'auto' }}
    />
  )
}
