import { supabase } from "./client";

export type SupabaseProfile = {
  id: string;
  email: string;
  full_name: string;
  role: "brand" | "agency" | "talent";
  created_at: string;
  updated_at: string;
};

export type SupabaseWorkspace = {
  id: string;
  name: string;
  type: "brand" | "agency" | "talent_independent";
  agncy_id: string;
  owner_id: string;
  created_at: string;
};

export type SupabaseMembership = {
  id: string;
  profile_id: string;
  workspace_id: string;
  role: string;
  status: "active" | "invited" | "requested";
  created_at: string;
  workspaces: SupabaseWorkspace;
};


export async function getUserProfileAndWorkspaces(userId: string) {
  try {
    // 1. Fetch profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      console.error("Error fetching user profile:", profileError);
      return null;
    }

    // 2. Fetch memberships along with workspace details
    const { data: memberships, error: membershipsError } = await supabase
      .from("memberships")
      .select(`
        id,
        profile_id,
        workspace_id,
        role,
        status,
        created_at,
        workspaces (
          id,
          name,
          type,
          agncy_id,
          owner_id,
          created_at
        )
      `)
      .eq("profile_id", userId);

    if (membershipsError || !memberships) {
      console.error("Error fetching memberships:", membershipsError);
      return { profile: profile as SupabaseProfile, memberships: [] };
    }

    // Cast workspaces nested relation
    const mappedMemberships = (memberships as any[]).map((m) => ({
      id: m.id,
      profile_id: m.profile_id,
      workspace_id: m.workspace_id,
      role: m.role,
      status: m.status,
      created_at: m.created_at,
      workspaces: m.workspaces as SupabaseWorkspace,
    }));

    return {
      profile: profile as SupabaseProfile,
      memberships: mappedMemberships,
    };
  } catch (error) {
    console.error("Unexpected error fetching user details from Supabase:", error);
    return null;
  }
}
