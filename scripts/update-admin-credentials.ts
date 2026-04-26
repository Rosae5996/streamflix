import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcrypt";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("[v0] Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function updateAdminCredentials() {
  const adminEmail = "alfacarlos981@gmail.com";
  const adminPassword = "8Car9loS@50419706";

  try {
    console.log("[v0] Starting admin credentials update...");

    // Hash the password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    console.log("[v0] Password hashed successfully");

    // Update or create admin user in auth
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
      });

    if (authError && !authError.message.includes("already registered")) {
      console.error("[v0] Auth error:", authError);
      throw authError;
    }

    const userId = authData?.user?.id || (await getUserIdByEmail(adminEmail));
    console.log("[v0] User ID:", userId);

    if (!userId) {
      throw new Error("Could not get user ID");
    }

    // Upsert user in users table
    const { error: upsertError } = await supabase.from("users").upsert(
      {
        id: userId,
        email: adminEmail,
        full_name: "Administrador",
        password_hash: hashedPassword,
        role: "admin",
        is_active: true,
      },
      { onConflict: "id" }
    );

    if (upsertError) {
      console.error("[v0] Upsert error:", upsertError);
      throw upsertError;
    }

    console.log("[v0] Admin credentials updated successfully!");
    console.log("[v0] Email:", adminEmail);
    console.log("[v0] Password:", adminPassword);
    console.log("[v0] Role: admin");
    console.log("[v0] Status: READY TO LOGIN");
  } catch (error) {
    console.error("[v0] Error updating credentials:", error);
    process.exit(1);
  }
}

async function getUserIdByEmail(email: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .single();

  if (error) {
    console.log("[v0] User not found, will be created");
    return null;
  }

  return data?.id || null;
}

updateAdminCredentials();
