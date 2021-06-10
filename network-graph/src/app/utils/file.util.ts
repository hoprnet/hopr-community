
export abstract class FileUtil {
  abstract readFileAsync(path: string): Promise<any>;
  abstract writeFile(data: any, path?: string): void;
}
