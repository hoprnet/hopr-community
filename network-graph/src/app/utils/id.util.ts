import { v1 as uuidv1 } from 'uuid';

export class IdUtil {

  public static create(): string {
    return uuidv1();
  }

}
