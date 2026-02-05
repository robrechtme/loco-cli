import { Config } from '../../types';
import { cosmiconfig } from 'cosmiconfig';

const explorer = cosmiconfig('loco');

export const readConfig = async (): Promise<Partial<Config>> => {
  const result = await explorer.search();
  return result?.config ?? {};
};
