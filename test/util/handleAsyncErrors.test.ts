import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { handleAsyncErrors } from '../../src/util/handleAsyncErrors';
import { CliError } from '../../src/util/errors';

describe('handleAsyncErrors', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    process.exitCode = 0;
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    process.exitCode = 0;
    consoleSpy.mockRestore();
  });

  test('leaves exitCode unchanged when the wrapped fn resolves', async () => {
    const wrapped = handleAsyncErrors(async () => {});
    await wrapped();
    expect(process.exitCode).toBe(0);
  });

  test('sets exitCode to 1 on any thrown Error', async () => {
    const wrapped = handleAsyncErrors(async () => {
      throw new Error('boom');
    });
    await wrapped();
    expect(process.exitCode).toBe(1);
  });

  test('sets exitCode to 1 on CliError without printing the generic message', async () => {
    const wrapped = handleAsyncErrors(async () => {
      throw new CliError('caller already logged');
    });
    await wrapped();
    expect(process.exitCode).toBe(1);
    // Generic "An unexpected error occurred" wrapper is suppressed for CliError
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  test('prints the access-key hint on a 401 HTTPError', async () => {
    const wrapped = handleAsyncErrors(async () => {
      throw new Error('HTTPError: 401 Unauthorized');
    });
    await wrapped();
    expect(process.exitCode).toBe(1);
    const printed = consoleSpy.mock.calls.map((c: unknown[]) => String(c[0])).join('\n');
    expect(printed).toContain('Invalid access key');
  });

  test('prints the generic message on other errors', async () => {
    const wrapped = handleAsyncErrors(async () => {
      throw new Error('something else');
    });
    await wrapped();
    expect(process.exitCode).toBe(1);
    const printed = consoleSpy.mock.calls.map((c: unknown[]) => String(c[0])).join('\n');
    expect(printed).toContain('An unexpected error occurred');
    expect(printed).toContain('something else');
  });
});
