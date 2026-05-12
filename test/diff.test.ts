import { expect, test } from 'vitest';
import { diff } from '../src/lib/diff';
import { local, remote } from './mockdata/mockDiff';

test('returns diff', () => {
  expect(diff(local, remote)).toMatchSnapshot();
});

test('returns diff without new assets', () => {
  expect(diff(local, remote, { 'ignore-new': true })).toMatchSnapshot();
});

test('returns diff without updated assets', () => {
  expect(diff(local, remote, { 'ignore-existing': true })).toMatchSnapshot();
});

test('experimentalPushAll filters union-protected deletions', () => {
  // Simulates the post-first-push state from issue #56: en has a key,
  // fr/es do not locally, but Loco created empty source-fallback entries
  // for fr/es. The diff would normally flag fr/es as deletions, but the
  // multi-locale upload would not delete them (union-protected by en).
  const remoteData = {
    en: { hello: 'Hello', newKey: 'Value' },
    fr: { hello: 'Bonjour', newKey: '' },
    es: { hello: 'Hola', newKey: '' }
  };
  const localData = {
    en: { hello: 'Hello', newKey: 'Value' },
    fr: { hello: 'Bonjour' },
    es: { hello: 'Hola' }
  };

  const result = diff(remoteData, localData, {
    experimentalPushAll: true,
    'ignore-existing': true,
    'delete-absent': true
  });

  expect(result.deleted).toEqual({});
  expect(result.deletedCount).toBe(0);
  expect(result.totalCount).toBe(0);
});

test('experimentalPushAll filters union-protected deletions across missing branches', () => {
  // detailedDiff collapses entirely-missing branches (e.g. fs-local nl has
  // no E2E subtree at all) into a single undefined at the branch level.
  // The fix has to recover leaf-level resolution to apply union semantics.
  const remoteData = {
    en: { HomeScreen: { Title: 'x' }, E2E: { TestKey: 'val' } },
    nl: { HomeScreen: { Title: 'y' }, E2E: { TestKey: '' } }
  };
  const localData = {
    en: { HomeScreen: { Title: 'x' }, E2E: { TestKey: 'val' } },
    nl: { HomeScreen: { Title: 'y' } }
  };

  const result = diff(remoteData, localData, {
    experimentalPushAll: true,
    'ignore-existing': true,
    'delete-absent': true
  });

  expect(result.deleted).toEqual({});
  expect(result.deletedCount).toBe(0);
  expect(result.totalCount).toBe(0);
});

test('experimentalPushAll keeps leaf deletions even when sibling leaves are union-protected', () => {
  // api-remote has two leaves under a branch (TestKey, OtherKey), but only
  // TestKey appears in any local locale. OtherKey is a legitimate union-
  // absent deletion that the upload WILL perform, so it must stay in the
  // diff. A naive prefix-based filter would over-collapse this case.
  const remoteData = {
    en: { E2E: { TestKey: 'val', OtherKey: 'gone' } },
    nl: { E2E: { TestKey: '', OtherKey: '' } }
  };
  const localData = {
    en: { E2E: { TestKey: 'val' } },
    nl: {}
  };

  const result = diff(remoteData, localData, {
    experimentalPushAll: true,
    'ignore-existing': true,
    'delete-absent': true
  });

  expect(result.deleted).toEqual({
    'en.E2E.OtherKey': undefined,
    'nl.E2E.OtherKey': undefined
  });
  expect(result.deletedCount).toBe(2);
});

test('experimentalPushAll still reports deletions absent from every local locale', () => {
  // A key that's been removed from every local locale is a legitimate
  // deletion under union semantics — it should remain in the diff.
  const remoteData = {
    en: { hello: 'Hello', staleKey: 'Old' },
    fr: { hello: 'Bonjour', staleKey: 'Vieux' }
  };
  const localData = {
    en: { hello: 'Hello' },
    fr: { hello: 'Bonjour' }
  };

  const result = diff(remoteData, localData, {
    experimentalPushAll: true,
    'delete-absent': true
  });

  expect(result.deleted).toEqual({
    'en.staleKey': undefined,
    'fr.staleKey': undefined
  });
  expect(result.deletedCount).toBe(2);
});

test('experimentalPushAll without delete-absent does not filter (informational only)', () => {
  // Without delete-absent, the upload won't delete anything regardless of
  // union semantics, so the deleted set is purely informational and should
  // be reported per-locale unchanged.
  const remoteData = {
    en: { hello: 'Hello', newKey: 'Value' },
    fr: { hello: 'Bonjour', newKey: '' }
  };
  const localData = {
    en: { hello: 'Hello', newKey: 'Value' },
    fr: { hello: 'Bonjour' }
  };

  const result = diff(remoteData, localData, { experimentalPushAll: true });

  expect(result.deleted).toEqual({ 'fr.newKey': undefined });
  expect(result.deletedCount).toBe(1);
});

test('without experimentalPushAll deletions remain per-locale (no union filtering)', () => {
  // Per-locale upload path: delete-absent really does apply per locale,
  // so the diff must keep per-locale deletions.
  const remoteData = {
    en: { hello: 'Hello', newKey: 'Value' },
    fr: { hello: 'Bonjour', newKey: '' }
  };
  const localData = {
    en: { hello: 'Hello', newKey: 'Value' },
    fr: { hello: 'Bonjour' }
  };

  const result = diff(remoteData, localData, { 'delete-absent': true });

  expect(result.deleted).toEqual({ 'fr.newKey': undefined });
  expect(result.deletedCount).toBe(1);
});
