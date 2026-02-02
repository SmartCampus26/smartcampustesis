// deno-lint-ignore-file
import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.93.3"

serve(async (req) => {
  try {
    const { email } = await req.json()

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email requerido" }),
        { status: 400 }
      )
    }

    const supabaseAdmin = createClient(
      Deno.env.get("PROJECT_URL")!,
      Deno.env.get("SERVICE_ROLE_KEY")!
    )

    // 🔥 Esto dispara el correo de confirmación
    const { error } = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: false,
    })

    if (error) throw error

    return new Response(
      JSON.stringify({ ok: true }),
      { status: 200 }
    )
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500 }
    )
  }
})
