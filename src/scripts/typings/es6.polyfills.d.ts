// es6 polyfills
// pulled from lib.es6.d.ts

// chrome supports Set from 38 @see:https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
interface Set<T> {
  add(value: T): this;
  clear(): void;
  delete(value: T): boolean;
  forEach(callbackfn: (value: T, value2: T, set: Set<T>) => void, thisArg?: any): void;
  has(value: T): boolean;
  readonly size: number;
}

interface SetConstructor {
  new (): Set<any>;
  new <T>(values?: T[]): Set<T>;
  readonly prototype: Set<any>;
}
declare var Set: SetConstructor;

interface ES2015String extends String {
	startsWith: (searchString: string, position?: number) => boolean;
	endsWith: (searchString: string, length?: number) => boolean;
}