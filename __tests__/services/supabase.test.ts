import { getFriendlyErrorMessage } from '../../src/services/supabase';

describe('src/services/supabase.ts - getFriendlyErrorMessage', () => {
  it('translates invalid credentials to user-friendly message', () => {
    const msg = getFriendlyErrorMessage({ message: 'Invalid login credentials' });
    expect(msg).toBe('Invalid email or password. Please check your credentials and try again.');
  });

  it('translates user already registered to friendly message', () => {
    expect(getFriendlyErrorMessage('User already registered')).toBe(
      'An account with this email address already exists.'
    );
    expect(getFriendlyErrorMessage({ message: 'User with this email already exists' })).toBe(
      'An account with this email address already exists.'
    );
  });

  it('translates short password errors', () => {
    const msg = getFriendlyErrorMessage('Password should be at least 6 characters');
    expect(msg).toBe('Your password must be at least 6 characters long.');
  });

  it('translates network and connection failures', () => {
    expect(getFriendlyErrorMessage('TypeError: Network request failed')).toBe(
      "We couldn't connect to WealthFlow. Please check your network connection and try again."
    );
    expect(getFriendlyErrorMessage({ details: 'fetch failed' })).toBe(
      "We couldn't connect to WealthFlow. Please check your network connection and try again."
    );
  });

  it('translates duplicate budget unique constraint violations', () => {
    const err = { message: 'duplicate key value violates unique constraint "budgets_user_id_category_id_period_key"' };
    expect(getFriendlyErrorMessage(err)).toBe('A budget already exists for this category.');
  });

  it('translates authorization errors', () => {
    expect(getFriendlyErrorMessage('Unauthorized')).toBe(
      'You are not authorized to modify this item.'
    );
    expect(getFriendlyErrorMessage('Goal not found or unauthorized')).toBe(
      'You are not authorized to modify this item.'
    );
  });

  it('translates invalid contribution amount errors', () => {
    const msg = getFriendlyErrorMessage('Contribution amount must be greater than zero');
    expect(msg).toBe('Please enter a valid contribution amount greater than $0.');
  });

  it('handles null, undefined, or unmapped generic errors with fallback message', () => {
    expect(getFriendlyErrorMessage(null)).toBe('An unexpected error occurred. Please try again.');
    expect(getFriendlyErrorMessage(undefined)).toBe('An unexpected error occurred. Please try again.');
    expect(getFriendlyErrorMessage('Custom unmapped error detail')).toBe('Custom unmapped error detail');
  });

  describe('Session expiration and technical auth error translation', () => {
    it('translates JWT expired message to friendly session expiration', () => {
      expect(getFriendlyErrorMessage('jwt expired')).toBe('Your session has expired. Please sign in again.');
      expect(getFriendlyErrorMessage({ message: 'JWT expired' })).toBe('Your session has expired. Please sign in again.');
      expect(getFriendlyErrorMessage({ error_description: 'token is expired' })).toBe('Your session has expired. Please sign in again.');
    });

    it('translates PGRST301 code and message to friendly session expiration', () => {
      expect(getFriendlyErrorMessage({ code: 'PGRST301', message: 'JWSError JWSInvalidSignature' })).toBe(
        'Your session has expired. Please sign in again.'
      );
      expect(getFriendlyErrorMessage('PGRST301: JWT expired')).toBe('Your session has expired. Please sign in again.');
    });

    it('translates invalid claim errors to friendly session expiration', () => {
      expect(getFriendlyErrorMessage({ message: 'invalid claim: missing sub' })).toBe(
        'Your session has expired. Please sign in again.'
      );
      expect(getFriendlyErrorMessage('invalid sub claim')).toBe('Your session has expired. Please sign in again.');
    });

    it('sanitizes unrelated database/PostgREST errors without classifying them as session expiration', () => {
      const unrelatedDbError = { code: 'PGRST116', message: 'The result contains 0 rows' };
      const msg1 = getFriendlyErrorMessage(unrelatedDbError);
      expect(msg1).not.toBe('Your session has expired. Please sign in again.');
      expect(msg1).toBe('An unexpected database error occurred. Please try again.');

      const sqlSyntaxError = { message: 'syntax error at or near "SELECT"' };
      const msg2 = getFriendlyErrorMessage(sqlSyntaxError);
      expect(msg2).not.toBe('Your session has expired. Please sign in again.');
      expect(msg2).toBe('An unexpected database error occurred. Please try again.');

      const internalPgError = { message: 'relation "public.profiles" does not exist' };
      const msg3 = getFriendlyErrorMessage(internalPgError);
      expect(msg3).not.toBe('Your session has expired. Please sign in again.');
      expect(msg3).toBe('An unexpected database error occurred. Please try again.');
    });
  });
});
