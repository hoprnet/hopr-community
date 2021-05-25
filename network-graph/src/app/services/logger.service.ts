import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { LogEventType } from '../enums/log.enum';
import { LogEventModel } from '../models/log.model';
import { CommonUtil } from '../utils/common.util';

export abstract class Logger {
  abstract get onLogEventSubject(): Subject<LogEventModel>;
  abstract debug: any;
  abstract info: any;
  abstract warn: any;
  abstract error: any;
  abstract clear(): void;
}

const noop = (): any => undefined;

@Injectable({
  providedIn: 'root'
})
export class DefaultLoggerService extends Logger {

  private _onLogEventSubject: Subject<LogEventModel>;

  constructor() {
    super();
    this._onLogEventSubject = new Subject<LogEventModel>();
  }

  public get onLogEventSubject(): Subject<LogEventModel> {
    return this._onLogEventSubject;
  }

  private get isEnabled(): boolean {
    return true;
  }

  private timestamp(type: string): string {
    return `[${type} ${new Date().toLocaleTimeString()}]`;
  }

  private createLogEventModel(type: string, ...args: any[]): LogEventModel {
    const mapFn = (e: any) => {
      if (CommonUtil.isString(e)) {
        return e;
      } else if (e instanceof Error) {
        return e.message;
      }
      return CommonUtil.toJsonString(e);
    };
    const result = new LogEventModel({
      type: LogEventType.MESSAGE,
      banner: this.timestamp(type),
      args: args?.map(e => Array.isArray(e) ? e.map(e1 => mapFn(e1)) : mapFn(e))
    });
    this._onLogEventSubject.next(result);
    return result;
  }

  get debug() {
    if (this.isEnabled) {
      return (...args: any[]) => {
        const result = this.createLogEventModel('DEBUG', args);
        return Function.prototype.bind.call(console.debug, console, result.banner, ...args);
      };
    } else {
      return noop;
    }
  }

  get info() {
    if (this.isEnabled) {
      return (...args: any[]) => {
        const result = this.createLogEventModel('INFO', args);
        return Function.prototype.bind.call(console.info, console, result.banner, ...args);
      };
    } else {
      return noop;
    }
  }

  get warn() {
    if (this.isEnabled) {
      return (...args: any[]) => {
        const result = this.createLogEventModel('WARN', args);
        return Function.prototype.bind.call(console.warn, console, result.banner, ...args);
      };
    } else {
      return noop;
    }
  }

  get error() {
    if (this.isEnabled) {
      return (...args: any[]) => {
        if (args?.length > 0) {
          if (!CommonUtil.isString(args[0])) {
            args.push('(See console output for more information.)');
          }
        }
        const result = this.createLogEventModel('ERROR', args);
        return Function.prototype.bind.call(console.error, console, result.banner, ...args);
      };
    } else {
      return noop;
    }
  }

  public clear(): void {
    this._onLogEventSubject.next(new LogEventModel({
      type: LogEventType.CLEAR
    }));
  }
}
