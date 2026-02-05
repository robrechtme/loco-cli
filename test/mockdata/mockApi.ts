export const mockTranslations = {
  en: {
    'common.hello': 'Hello',
    'common.bye': 'Goodbye',
    'home.title': 'Welcome'
  },
  es: {
    'common.hello': 'Hola',
    'common.bye': 'Adiós',
    'home.title': 'Bienvenido'
  }
};

export const mockSingleLocaleTranslations = {
  'common.hello': 'Hello',
  'common.bye': 'Goodbye'
};

export const mockMultipleLocales = [{ code: 'en' }, { code: 'es' }];

export const mockSingleLocale = [{ code: 'en' }];

export const createMockResponse = (data: unknown, ok = true, status = 200, statusText = 'OK') => ({
  ok,
  status,
  statusText,
  json: async () => data
});

export const createMockErrorResponse = (status: number, statusText: string) =>
  createMockResponse(null, false, status, statusText);
