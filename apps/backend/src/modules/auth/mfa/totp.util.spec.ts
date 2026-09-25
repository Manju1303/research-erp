import {
  generateTotpSecret,
  generateTotpUri,
  generateTotpToken,
  verifyTotpToken,
  base32Encode,
  base32Decode,
} from './totp.util';

describe('TOTP MFA Utility QA Tests', () => {
  it('correctly encodes and decodes Base32', () => {
    const raw = Buffer.from('Scriptara-Enterprise-QA-Test-Key');
    const encoded = base32Encode(raw);
    const decoded = base32Decode(encoded);
    expect(decoded.toString('utf-8')).toBe('Scriptara-Enterprise-QA-Test-Key');
  });

  it('generates a valid 32-character Base32 TOTP secret', () => {
    const secret = generateTotpSecret(20);
    expect(secret).toBeDefined();
    expect(secret.length).toBe(32);
    expect(/^[A-Z2-7]+$/.test(secret)).toBe(true);
  });

  it('generates a valid otpauth:// URI for authenticator apps', () => {
    const secret = 'JBSWY3DPEHPK3PXP';
    const uri = generateTotpUri(secret, 'admin@scriptara.com', 'Scriptara ERP');
    expect(uri).toContain('otpauth://totp/Scriptara%20ERP:admin%40scriptara.com');
    expect(uri).toContain('secret=JBSWY3DPEHPK3PXP');
    expect(uri).toContain('algorithm=SHA1');
    expect(uri).toContain('digits=6');
  });

  it('generates a 6-digit numeric token and verifies successfully within current window', () => {
    const secret = generateTotpSecret(20);
    const token = generateTotpToken(secret);
    expect(token).toBeDefined();
    expect(token.length).toBe(6);
    expect(/^\d{6}$/.test(token)).toBe(true);

    const isValid = verifyTotpToken(token, secret);
    expect(isValid).toBe(true);
  });

  it('rejects tampered or invalid 6-digit codes', () => {
    const secret = generateTotpSecret(20);
    expect(verifyTotpToken('000000', secret)).toBe(false);
    expect(verifyTotpToken('999999', secret)).toBe(false);
    expect(verifyTotpToken('', secret)).toBe(false);
    expect(verifyTotpToken('12345', secret)).toBe(false);
  });
});
