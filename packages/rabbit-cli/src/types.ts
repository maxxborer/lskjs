import { Interface } from 'readline';

export interface IWatchStream extends Interface {
  paused: boolean;
  closed: boolean;
}
export type watchStream = IWatchStream;
export type watchQueue = any[];
export type watchCallback = (raw: any, i: number) => void;
export type watchOptions = {
  concurrency?: number;
};
export type watchFn = (stream: watchStream, cb: watchCallback, options: watchOptions) => watchStream;
