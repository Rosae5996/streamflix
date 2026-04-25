import { createServerSupabaseClient } from '@/lib/supabase/server'

export interface SiteBranding {
  id: string
  siteTitle: string
  siteDescription?: string
  siteLogoUrl?: string
  siteFaviconUrl?: string
  primaryColor: string
  secondaryColor: string
  fontFamily: string
  maintenanceMode: boolean
  maintenanceMessage?: string
  updatedAt: Date
}

export async function getSiteBranding(): Promise<SiteBranding | null> {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('site_branding')
    .select('*')
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Failed to fetch site branding:', error)
    return null
  }

  if (!data) return null

  return {
    id: data.id,
    siteTitle: data.site_title,
    siteDescription: data.site_description,
    siteLogoUrl: data.site_logo_url,
    siteFaviconUrl: data.site_favicon_url,
    primaryColor: data.primary_color,
    secondaryColor: data.secondary_color,
    fontFamily: data.font_family,
    maintenanceMode: data.maintenance_mode,
    maintenanceMessage: data.maintenance_message,
    updatedAt: new Date(data.updated_at),
  }
}

export async function updateSiteBranding(
  branding: Partial<SiteBranding>
): Promise<SiteBranding> {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const { data, error } = await supabase
    .from('site_branding')
    .update({
      site_title: branding.siteTitle,
      site_description: branding.siteDescription,
      site_logo_url: branding.siteLogoUrl,
      site_favicon_url: branding.siteFaviconUrl,
      primary_color: branding.primaryColor,
      secondary_color: branding.secondaryColor,
      font_family: branding.fontFamily,
      maintenance_mode: branding.maintenanceMode,
      maintenance_message: branding.maintenanceMessage,
      updated_by: user.id,
      updated_at: new Date(),
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update branding: ${error.message}`)
  }

  return {
    id: data.id,
    siteTitle: data.site_title,
    siteDescription: data.site_description,
    siteLogoUrl: data.site_logo_url,
    siteFaviconUrl: data.site_favicon_url,
    primaryColor: data.primary_color,
    secondaryColor: data.secondary_color,
    fontFamily: data.font_family,
    maintenanceMode: data.maintenance_mode,
    maintenanceMessage: data.maintenance_message,
    updatedAt: new Date(data.updated_at),
  }
}

export async function toggleMaintenanceMode(
  enabled: boolean,
  message?: string
): Promise<void> {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const { error } = await supabase
    .from('site_branding')
    .update({
      maintenance_mode: enabled,
      maintenance_message: message,
      updated_by: user.id,
      updated_at: new Date(),
    })
    .limit(1)

  if (error) {
    throw new Error(`Failed to toggle maintenance mode: ${error.message}`)
  }
}
