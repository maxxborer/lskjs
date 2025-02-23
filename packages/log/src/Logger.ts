/* eslint-disable no-nested-ternary */
// import debug from 'debug';
import { isClient, isDev } from '@lskjs/env';

import { levelsPriority } from './config';
import { prettyFormat } from './pretty/prettyFormat';
import { ILogger, ILoggerMessage, ILoggerProps, LoggerLevelType } from './types';
import { env } from './utils/env';
import { stringify } from './utils/formats';
import { isLsklogWeb } from './utils/formats/lsklog';
import { omitNull } from './utils/omitNull';

const LOG_LEVEL = () => env('LOG_LEVEL', '');
const LOG_FORMAT = () => env('LOG_FORMAT', isDev || isClient ? 'pretty' : 'lsk');
// const LOG_DATA = () => !!env('LOG_DATA', 0);

export class Logger implements ILogger {
  prefix: string | null;
  ns: string | null;
  name: string | null;
  level: string;
  constructor(...propsArray: ILoggerProps[]) {
    this.setProps(...propsArray);
  }
  setProps(...propsArray: ILoggerProps[]): void {
    const fields = ['prefix', 'ns', 'name', 'level'];
    propsArray.forEach((props) => {
      Object.keys(props).forEach((key) => {
        if (!fields.includes(key)) return;
        this[key] = props[key];
      });
    });
    if (!this.level) this.level = 'trace';
    if (!levelsPriority[this.level]) throw new Error(`Incorrect level: ${this.level}`);
  }
  static create(...propsArray: ILoggerProps[]): ILogger {
    return new this(...propsArray);
  }
  createChild(...propsArray: ILoggerProps[]): ILogger {
    const ns = [this.ns, this.name].filter(Boolean).join('.'); // TODO: подумать, а правильно ли соединять ns и name
    // @ts-ignore
    return new this.constructor(this, { colors: null, ns }, ...propsArray);
  }
  getLevelPriority(level: string): number {
    return levelsPriority[level] || 0;
  }
  canLog(level: string): boolean {
    const logLevel = this.getLevelPriority(level);
    const currentLevel = this.getLevelPriority(this.level);
    const globalLevel = this.getLevelPriority(LOG_LEVEL());
    return logLevel >= currentLevel && logLevel >= globalLevel;
  }
  fatal(...args: any[]): void {
    if (!this.canLog('fatal')) return;
    this.__log('fatal', ...args);
  }
  error(...args: any[]): void {
    if (!this.canLog('error')) return;
    this.__log('error', ...args);
  }
  warn(...args: any[]): void {
    if (!this.canLog('warn')) return;
    this.__log('warn', ...args);
  }
  debug(...args: any[]): void {
    if (!this.canLog('debug')) return;
    this.__log('debug', ...args);
  }
  info(...args: any[]): void {
    if (!this.canLog('info')) return;
    this.__log('info', ...args);
  }
  trace(...args: any[]): void {
    if (!this.canLog('trace')) return;
    this.__log('trace', ...args);
  }
  // log(...args: any[]): void {
  //   if (!this.canLog('log')) return;
  //   this.__log('log', ...args);
  // }
  log(...args: any[]): void {
    // @ts-ignore
    // eslint-disable-next-line no-console
    if (console._log) {
      // @ts-ignore
      // eslint-disable-next-line no-console
      console._log(...args);
    } else {
      // eslint-disable-next-line no-console
      console.log(...args);
    }
  }
  __log(level: LoggerLevelType, ...args: any[]): void {
    const [mainArg, ...otherArgs] = args;
    let meta: ILoggerMessage = {
      name: this.name,
      ns: this.ns,
      level,
      time: new Date(),
    };
    let passArgs = args;
    if (isLsklogWeb(mainArg)) {
      meta = {
        ...meta,
        ...mainArg,
      };
      // console.log({mainArg})
      passArgs = otherArgs;
    }
    // // eslint-disable-next-line no-param-reassign
    // if (LOG_FORMAT() !== 'none' && LOG_FORMAT() !== 'pretty') args = args.map((arg) => toString(arg));

    // if (LOG_DATA()) meta.data = passArgs;
    if (LOG_FORMAT() === 'none') return;
    if (LOG_FORMAT() === 'pretty') {
      this.log(...prettyFormat(omitNull(meta), ...passArgs));
      return;
    }
    // console.log({ args, data, str, 'LOG_FORMAT()': LOG_FORMAT() });
    this.log(stringify(LOG_FORMAT(), omitNull(meta), ...passArgs));
  }
}

export default Logger;
