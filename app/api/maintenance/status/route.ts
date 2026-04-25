import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: settings } = await supabase
      .from('admin_settings')
      .select('*')
      .eq('setting_key', 'maintenance_mode')
      .single()

    const isMaintenanceMode = settings?.setting_value === 'true'

    return NextResponse.json({
      maintenance: isMaintenanceMode,
    })
  } catch (error) {
    console.error('Error checking maintenance status:', error)
    return NextResponse.json({
      maintenance: false,
    })
  }
}
