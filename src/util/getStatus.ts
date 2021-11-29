import Loco from "loco-api-js";
import { dotObject } from "./dotObject";

const getStatus = async (loco: Loco, translationsObject: object) => {
  // Compare local vs loco translations
  const localAssets = dotObject(translationsObject);
  const localAssetIDs = Object.keys(localAssets);

  const remoteAssetIDs = await loco.getAssetIds();

  // Check for local (newly created) translations that were not added to Loco yet
  const missingRemote: Record<string, string> = localAssetIDs
    .filter((id) => !remoteAssetIDs.includes(id))
    .reduce((acc, key) => ({ ...acc, [key]: localAssets[key] }), {});

  const missingLocal: Record<string, string> = remoteAssetIDs
    .filter((id) => !localAssetIDs.includes(id))
    .reduce((acc, key) => ({ ...acc, [key]: "key" }), {});

  return {
    missingRemote,
    missingLocal,
  };
};

export default getStatus;
