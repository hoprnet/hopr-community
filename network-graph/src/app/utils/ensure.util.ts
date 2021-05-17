export class Ensure {

  public static notNull(property: any, propertyName: string) {
    if (property === null || property === undefined) {
      throw new Error('Unexpected null exception. ' + propertyName);
    }
  }

  public static notNullOrWhiteSpace(property: string, propertyName: string) {
    if (property === null || property === undefined || property?.trim() === '') {
      throw new Error('Unexpected null exception. ' + propertyName);
    }
  }

}
