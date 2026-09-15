jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Prevent Supabase background auth refresh timers from hanging after Jest teardown
jest.mock('@supabase/supabase-js', () => {
  const actual = jest.requireActual('@supabase/supabase-js');
  return {
    ...actual,
    createClient: (url, key, options) => {
      return actual.createClient(url, key, {
        ...options,
        auth: {
          ...options?.auth,
          autoRefreshToken: false,
          persistSession: false,
        },
      });
    },
  };
});
