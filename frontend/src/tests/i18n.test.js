import { describe, it, expect } from 'vitest';
import { translations, languages } from '../i18n/translations';

describe('Internationalization (i18n) Engine', () => {
  it('supports all 5 required languages', () => {
    const languageCodes = languages.map((l) => l.code);
    expect(languageCodes).toContain('English');
    expect(languageCodes).toContain('Tamil');
    expect(languageCodes).toContain('Tanglish');
    expect(languageCodes).toContain('Hindi');
    expect(languageCodes).toContain('Telugu');
  });

  it('contains mandatory keys in English dictionary', () => {
    const en = translations['English'];
    expect(en).toBeDefined();
    expect(en.appTitle).toBe('Maruthuvam.AI');
    expect(en.dashboard).toBe('Dashboard');
    expect(en.triage).toBe('Triage');
    expect(en.logToday).toBe('Log Today');
    expect(en.records).toBe('Records');
    expect(en.reminders).toBe('Reminders');
    expect(en.healthScore).toBe('Health Score');
    expect(en.abha).toBe('ABHA Link');
  });

  it('contains valid non-empty translations across all language dictionaries', () => {
    for (const lang of ['English', 'Tamil', 'Tanglish', 'Hindi', 'Telugu']) {
      const dict = translations[lang];
      expect(dict).toBeDefined();
      expect(dict.appTitle).toBeTruthy();
      expect(dict.dashboard).toBeTruthy();
      expect(dict.triage).toBeTruthy();
      expect(dict.water).toBeTruthy();
      expect(dict.sleep).toBeTruthy();
      expect(dict.steps).toBeTruthy();
    }
  });
});
