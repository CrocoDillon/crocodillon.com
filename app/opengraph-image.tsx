import { createSocialImage, socialImageSize } from '@/lib/social-image'

export const alt = 'CrocoDillon — Notes from the web'
export const size = socialImageSize
export const contentType = 'image/png'

export default function Image() {
  return createSocialImage({ title: 'Notes from the web.' })
}
