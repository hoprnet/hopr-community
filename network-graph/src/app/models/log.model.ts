import { LogEventType } from '../enums/log.enum';

export class LogEventModel {
  type: LogEventType;
  banner: string;
  args: any[];

  public constructor(init?: Partial<LogEventModel>) {
    Object.assign(this, init);
  }
}
