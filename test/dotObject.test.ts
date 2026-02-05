import { expect, test, describe } from 'vitest';
import { dotObject, flattenAllTranslations } from '../src/lib/dotObject';
import { local } from './mockdata/mockDiff';

test('dotObject', () => {
  expect(dotObject(local.en)).toStrictEqual({
    title: 'Newly added key local in EN only',
    'buttons.confirm': 'Confirm',
    'buttons.dismiss': 'Dismiss',
    'buttons.skip': 'Newly added key deep local in EN only'
  });
});

describe('flattenAllTranslations', () => {
  test('flattens all locales', () => {
    const translations = {
      en: { common: { hello: 'Hello', bye: 'Goodbye' } },
      es: { common: { hello: 'Hola', bye: 'Adiós' } }
    };

    expect(flattenAllTranslations(translations)).toStrictEqual({
      en: { 'common.hello': 'Hello', 'common.bye': 'Goodbye' },
      es: { 'common.hello': 'Hola', 'common.bye': 'Adiós' }
    });
  });

  test('handles empty translations', () => {
    expect(flattenAllTranslations({})).toStrictEqual({});
  });

  test('handles single locale', () => {
    const translations = {
      en: { title: 'Title', nested: { key: 'Value' } }
    };

    expect(flattenAllTranslations(translations)).toStrictEqual({
      en: { title: 'Title', 'nested.key': 'Value' }
    });
  });

  test('handles deeply nested structures', () => {
    const translations = {
      en: {
        a: {
          b: {
            c: {
              d: 'deep value'
            }
          }
        }
      }
    };

    expect(flattenAllTranslations(translations)).toStrictEqual({
      en: { 'a.b.c.d': 'deep value' }
    });
  });
});
