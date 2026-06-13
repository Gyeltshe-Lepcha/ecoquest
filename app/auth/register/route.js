import { NextResponse } from 'next/server';
import { publicUser, users } from '@/lib/ecoquest-data';
import {
  createPublicSupabaseClient,
  maybeCreateServerSupabaseClient,
} from '@/lib/supabase/server';

function avatarFromName(name) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function publicUserFromProfile(profile) {
  return {
    user_id: profile.user_id,
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    campus: profile.campus,
    total_points: profile.eco_points,
    streak_days: profile.streak_days,
    role: profile.role,
    avatar: profile.avatar,
    created_at: profile.created_at,
  };
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const { name, email, phone, campus, password } = body;

  if (!name || (!email && !phone) || !password) {
    return NextResponse.json(
      { error: 'Name, password, and either email or phone are required.' },
      { status: 400 },
    );
  }

  const trimmedEmail = email?.trim().toLowerCase();
  const trimmedPhone = phone?.trim() || null;
  const selectedCampus = campus ?? 'Household / General User';
  const supabaseAdmin = maybeCreateServerSupabaseClient();
  const userId = `USR-${String(Date.now()).slice(-6)}`;
  const avatar = avatarFromName(name);

  if (supabaseAdmin && trimmedEmail) {
    try {
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: trimmedEmail,
        password,
        email_confirm: true,
        user_metadata: {
          name,
          phone: trimmedPhone,
          campus: selectedCampus,
          ecoquest_user_id: userId,
        },
      });

      if (authError) {
        const status = authError.message.toLowerCase().includes('already') ? 409 : 500;
        return NextResponse.json({ error: authError.message }, { status });
      }

      const profile = {
        auth_user_id: authData.user.id,
        user_id: userId,
        name,
        email: trimmedEmail,
        phone: trimmedPhone,
        campus: selectedCampus,
        role: 'user',
        level: 1,
        eco_points: 0,
        streak_days: 0,
        current_rank: null,
        avatar,
      };

      const { data: savedProfile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert(profile)
        .select()
        .single();

      if (profileError) {
        return NextResponse.json({ error: profileError.message }, { status: 500 });
      }

      return NextResponse.json(
        {
          user: publicUserFromProfile(savedProfile),
          auth_user_id: authData.user.id,
          provider: 'supabase-admin',
          note: 'Account created in Supabase Auth and public.profiles.',
        },
        { status: 201 },
      );
    } catch (error) {
      return NextResponse.json(
        {
          error: `Supabase signup request failed: ${error.message}. Check internet connection, Supabase project status, and .env keys.`,
        },
        { status: 500 },
      );
    }
  }

  if (trimmedEmail) {
    try {
      const supabase = createPublicSupabaseClient();
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            name,
            phone: trimmedPhone,
            campus: selectedCampus,
            ecoquest_user_id: userId,
          },
        },
      });

      if (error) {
        const status = error.message.toLowerCase().includes('already') ? 409 : 500;
        return NextResponse.json({ error: error.message }, { status });
      }

      return NextResponse.json(
        {
          user: {
            user_id: userId,
            name,
            email: trimmedEmail,
            phone: trimmedPhone,
            campus: selectedCampus,
            total_points: 0,
            streak_days: 0,
            role: 'user',
            avatar,
            created_at: new Date().toISOString(),
          },
          auth_user_id: data.user?.id ?? null,
          provider: 'supabase-public',
          note: 'Account created in Supabase Auth. Add SUPABASE_SECRET_KEY to also create public.profiles automatically.',
        },
        { status: 201 },
      );
    } catch {
      // Continue to prototype fallback when Supabase env is not configured locally.
    }
  }

  if (email && users.some((user) => user.email === email)) {
    return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
  }

  const user = {
    user_id: `USR-${String(users.length + 1001).padStart(4, '0')}`,
    name,
    email: trimmedEmail ?? null,
    phone: trimmedPhone,
    password_hash: '$2b$10$prototype.hash.replace.with.bcrypt',
    campus: selectedCampus,
    hostel: 'Not set',
    total_points: 0,
    streak_days: 0,
    role: 'user',
    avatar,
    created_at: new Date().toISOString(),
  };

  users.push(user);

  return NextResponse.json(
    {
      user: publicUser(user),
      token: `demo.jwt.${user.user_id}`,
      note: 'Prototype endpoint. Replace the demo token and password hash with JWT + bcrypt in production.',
    },
    { status: 201 },
  );
}
