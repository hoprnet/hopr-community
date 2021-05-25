import { Injectable } from '@angular/core';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class MomentUtil {

  constructor() {
    moment.locale(navigator.language);
  }

  public setLocale(language: string): void {
    moment.locale(language);
  }

  public getFromUnix(date: number) {
    return moment.unix(date);
  }

  public getLocal(date: any): moment.Moment {
    return moment.utc(date).local();
  }

  public getLocalTime(date: any): string {
    return this.getLocal(date).format('LTS');
  }

  public getLocalDate(date: any): string {
    return this.getLocal(date).format('L');
  }

  public getLocalFormatted(date: any): string {
    return this.getLocalTime(date) + ' ' + this.getLocalDate(date);
  }

  public getLocalReverseFormatted(date: any): string {
    return this.getLocalDate(date) + ' ' + this.getLocalTime(date);
  }
}
