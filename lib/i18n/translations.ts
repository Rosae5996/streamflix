import { createServerSupabaseClient } from '@/lib/supabase/server'

export type LanguageCode = 'es' | 'en' | 'fr' | 'pt'

export interface Translation {
  language: LanguageCode
  key: string
  value: string
}

export const SUPPORTED_LANGUAGES: Record<LanguageCode, string> = {
  es: 'Español',
  en: 'English',
  fr: 'Français',
  pt: 'Português',
}

export async function getTranslations(
  languageCode: LanguageCode
): Promise<Record<string, string>> {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('site_translations')
    .select('translation_key, translation_value')
    .eq('language_code', languageCode)

  if (error) {
    console.error(`Failed to fetch translations for ${languageCode}:`, error)
    return {}
  }

  const translations: Record<string, string> = {}
  data?.forEach((item) => {
    translations[item.translation_key] = item.translation_value
  })

  return translations
}

export async function updateTranslation(
  languageCode: LanguageCode,
  key: string,
  value: string
): Promise<void> {
  const supabase = await createServerSupabaseClient()

  const { error } = await supabase
    .from('site_translations')
    .upsert(
      {
        language_code: languageCode,
        translation_key: key,
        translation_value: value,
        updated_at: new Date(),
      },
      {
        onConflict: 'language_code,translation_key',
      }
    )

  if (error) {
    throw new Error(`Failed to update translation: ${error.message}`)
  }
}

export async function getAllTranslations(): Promise<
  Record<LanguageCode, Record<string, string>>
> {
  const allTranslations: Record<LanguageCode, Record<string, string>> = {
    es: {},
    en: {},
    fr: {},
    pt: {},
  }

  for (const lang of Object.keys(SUPPORTED_LANGUAGES) as LanguageCode[]) {
    allTranslations[lang] = await getTranslations(lang)
  }

  return allTranslations
}

export function t(
  key: string,
  translations: Record<string, string>,
  defaultValue?: string
): string {
  return translations[key] || defaultValue || key
}
