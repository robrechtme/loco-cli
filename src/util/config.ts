import { cosmiconfig } from 'cosmiconfig';
import type { Config } from '../../types';

const explorer = cosmiconfig('loco');

export const readConfig = async (): Promise<Partial<Config>> => {
  const result = await explorer.search();
  return result?.config ?? {};
};
