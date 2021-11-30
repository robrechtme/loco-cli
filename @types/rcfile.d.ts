declare module "rcfile" {
  export interface Options {
    configFileName?: string;
    defaultExtension?: string;
    cwd?: string;
  }
  rcfile = <T extends object>(pkgName: string, opts?: Options) => T;

  export default rcfile;
}
