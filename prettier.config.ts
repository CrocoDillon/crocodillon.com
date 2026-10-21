import type { Config } from 'prettier'
import type { PluginOptions } from 'prettier-plugin-tailwindcss'

const config: Config & PluginOptions = {
  arrowParens: 'avoid',
  embeddedLanguageFormatting: 'off',
  plugins: ['prettier-plugin-tailwindcss'],
  semi: false,
  singleQuote: true,
  tailwindStylesheet: './app/globals.css',
  trailingComma: 'es5',
}

export default config
