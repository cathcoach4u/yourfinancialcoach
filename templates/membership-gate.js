// MEMBERSHIP GATE SNIPPET
// -----------------------
// Paste inside your <script type="module"> at the top of page logic.
// Requires: supabase already initialised.
//
// Root-level pages: use 'auth/login.html' and 'auth/inactive.html'
// Subfolder pages:  use '../auth/login.html' and '../auth/inactive.html'

const { data: { user }, error: userError } = await supabase.auth.getUser();

if (!user || userError) {
  window.location.href = 'auth/login.html';
  throw new Error('No user');
}

const { data: profile } = await supabase
  .from('users')
  .select('membership_status')
  .eq('id', user.id)
  .single();

if (!profile || profile.membership_status !== 'active') {
  window.location.href = 'auth/inactive.html';
  throw new Error('Membership inactive');
}

// User confirmed active — page logic continues below.
