import { describe, expect, test } from 'vitest';
import { splitIntoNamespaces } from '../src/util/namespaces';

describe('splitIntoNamespaces', () => {
  test('splits keys with colons into namespaces', async () => {
    const input = splitIntoNamespaces({
      'default:key': 'value',
      'group:key-with-colon:': 'Value with colon:',
      'another:group:key': 'Value: with colon'
    });

    const expected = {
      default: {
        key: 'value'
      },
      group: {
        'key-with-colon:': 'Value with colon:'
      },
      another: {
        'group:key': 'Value: with colon'
      }
    };

    expect(input).toStrictEqual(expected);
  });
});
