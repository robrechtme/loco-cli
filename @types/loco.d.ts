declare module "loco-api-js" {
  export interface Asset {
    /** Unique asset identifier */
    id: string;
    /** Content type for translations */
    type: string;
    /** Optional context descriptor */
    context: string;
    /** Optional notes for translators */
    notes: string;
    /** String formatting style */
    printf: string;
    /** Time last modified in UTC */
    modified: string;
    /** Number of associated plural forms */
    plurals: number;
    /* Array of terms asset is tagged with */
    tags: string[];
    aliases: Record<string, string>;
    progress: {
      /** Number of locales for which a translation exists (including those flagged) */
      translated: number;
      /** Number of locales that do not yet have a translation of this asset */
      untranslated: number;
      /** Number of locales whose translations are flagged as requiring attention */
      flagged: number;
    };
  }

  export interface Options {
    /** Unique asset ID up to 999 bytes (leave blank to auto-generate) */
    id?: string;
    /** Initial source language translation (required if {id} is empty) */
    text?: string;
    /**	Content type for all translations of the new asset default: "text" */
    type?: "text" | "html" | "xml";
    /**	Optional context descriptor */
    context?: string;
    /**	Optional notes for translators */
    notes?: string;
    /**	Status of the source language translation specified in {text}	string	default: "translated" */
    default?: string;
  }

  export type Translations = Record<string, Record<string, string>>;

  /** Loco Client SDK */
  export default class Loco {
    constructor(apiKey?: string, options?: { fileName: string });

    getAssetIds(): Promise<string[]>;
    tagAsset(id: string, tag: string): Promise<Asset>;
    createAsset(opts: Options): Promise<Asset>;
    getAssets(): Promise<Asset[]>;
    doExport(): Promise<Translations>;
  }
}
