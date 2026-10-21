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
      sizes={`(max-width: ${src.width + 48}px) calc(100vw - 48px), ${src.width}px`}
      className="rounded-sm bg-[#f8f9f5]"
      style={{ width: src.width, maxWidth: '100%', height: 'auto' }}
    />
  )
}
