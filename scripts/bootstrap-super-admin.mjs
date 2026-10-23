#!/usr/bin/env node
/**
 * Bootstrap the initial Super Admin for Hustlers Hive.
 *
 * This script is idempotent: re-running it will NOT create a duplicate user
 * or silently promote an existing non-admin account.
 *
 * Required environment variables (server-only, never committed):
 *   NEXT_PUBLIC_SUPABASE_URL         — Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY        — Service role key (server-only)
 *   INITIAL_SUPER_ADMIN_EMAIL        — The owner's email
 *   INITIAL_SUPER_ADMIN_PASSWORD     — The owner's initial password
 *
 * Usage:
 *   1. Set the four env vars above (in a .env.local or export them).
 *   2. Run: node scripts/bootstrap-super-admin.mjs
 *   3. After success, remove INITIAL_SUPER_ADMIN_EMAIL and
 *      INITIAL_SUPER_ADMIN_PASSWORD from your environment.
 *   4. Sign in to the admin dashboard and change the password immediately.
 *
 * Security notes:
 *   - The service-role key is used only to create the auth user and insert
 *     the admin_users + profiles row. It is never sent to any browser.
 *   - The initial password is never logged or written to any file.
 *   - If the email already belongs to a user, the script stops with an error.
 */

import { createClient } from "@supabase/supabase-js";

// ── Validate environment ────────────────────────────────────────────────────

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`ERROR: Missing required environment variable: ${name}`);
    process.exit(1);
  }
  return value;
}

const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
const email = requireEnv("INITIAL_SUPER_ADMIN_EMAIL");
const password = requireEnv("INITIAL_SUPER_ADMIN_PASSWORD");

if (password.length < 8) {
  console.error("ERROR: INITIAL_SUPER_ADMIN_PASSWORD must be at least 8 characters.");
  process.exit(1);
}

// ── Create service-role client ──────────────────────────────────────────────

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log(`\nBootstrapping Super Admin for: ${email}\n`);

  // 1. Check if a user with this email already exists
  const { data: existingUsers, error: listError } =
    await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });

  if (listError) {
    console.error("ERROR: Failed to list existing users:", listError.message);
    process.exit(1);
  }

  const existingUser = existingUsers.users.find(
    (u) => u.email?.toLowerCase() === email.toLowerCase()
  );

  if (existingUser) {
    // Check if they are already a super_admin
    const { data: adminRow } = await supabase
      .from("admin_users")
      .select("role, status")
      .eq("user_id", existingUser.id)
      .single();

    if (adminRow?.role === "super_admin" && adminRow?.status === "active") {
      console.log("Super Admin already exists and is active. Nothing to do.");
      process.exit(0);
    }

    if (adminRow) {
      console.error(
        `ERROR: User ${email} exists with role '${adminRow.role}' (status: ${adminRow.status}).`
      );
      console.error(
        "Refusing to silently promote an existing account. To resolve:"
      );
      console.error(
        "  - If this IS the owner, manually update admin_users in the database."
      );
      console.error(
        "  - If this is NOT the owner, use a different email."
      );
      process.exit(1);
    }

    // User exists in auth but not in admin_users — this is unexpected
    console.error(
      `ERROR: User ${email} exists in auth.users but has no admin_users row.`
    );
    console.error(
      "This may indicate an incomplete setup. Manually verify the account"
    );
    console.error("before retrying. Do NOT blindly promote unknown accounts.");
    process.exit(1);
  }

  // 2. Create the auth user
  const { data: newUser, error: createError } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

  if (createError) {
    console.error("ERROR: Failed to create auth user:", createError.message);
    process.exit(1);
  }

  const userId = newUser.user.id;
  console.log(`Auth user created: ${userId}`);

  // 3. Insert profile
  const { error: profileError } = await supabase
    .from("profiles")
    .insert({ user_id: userId, full_name: "Platform Owner" });

  if (profileError) {
    console.error("WARNING: Failed to create profile:", profileError.message);
    console.error("The admin user will be created, but update the profile name manually.");
  } else {
    console.log("Profile created.");
  }

  // 4. Insert super_admin row
  const { error: adminError } = await supabase
    .from("admin_users")
    .insert({ user_id: userId, role: "super_admin", status: "active" });

  if (adminError) {
    console.error("ERROR: Failed to insert admin_users row:", adminError.message);
    console.error("The auth user was created but lacks a role. Fix manually:");
    console.error(
      `  INSERT INTO admin_users (user_id, role, status) VALUES ('${userId}', 'super_admin', 'active');`
    );
    process.exit(1);
  }

  console.log("Super Admin role assigned.");

  // 5. Log success
  console.log("\n✓ Bootstrap complete.");
  console.log("\nNext steps:");
  console.log("  1. Sign in at your admin URL with the email and password.");
  console.log("  2. Change the initial password immediately.");
  console.log("  3. Remove INITIAL_SUPER_ADMIN_EMAIL and INITIAL_SUPER_ADMIN_PASSWORD");
  console.log("     from your environment variables.\n");
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
