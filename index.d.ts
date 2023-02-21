// TypeScript Version: 4.7

export interface Thenable <R> {
    then <U> (onFulfilled?: (value: R) => U | Thenable<U>, onRejected?: (error: any) => U | Thenable<U>): Thenable<U>;
    then <U> (onFulfilled?: (value: R) => U | Thenable<U>, onRejected?: (error: any) => void): Thenable<U>;
}

type SettledStatus = 'fulfilled' | 'rejected';

export interface GenericAbortSignal {
    readonly aborted: boolean;
    onabort?: ((...args: any) => any) | null;
    addEventListener?: (...args: any) => any;
    removeEventListener?: (...args: any) => any;
}

interface AxiosPromiseOptions {
    signal?: GenericAbortSignal;
    timeout?: number;
}

type AtomicModeAwait = false;
type AtomicModeDetached = true;

type AtomicMode = AtomicModeAwait | AtomicModeDetached;

interface AxiosPromiseResolveOptions {
    atomic?: AtomicMode
}

interface PromisifyOptions {
    scopeArg?: boolean;
}

export class CanceledError extends Error {
    constructor(message?: string);
    readonly name: string;
    readonly code: string;
    readonly scope: AxiosPromise<any>;
    static from(thing: any): CanceledError;
    static isCanceledError(thing: any): boolean;
    static addSignature(target: object): void;
    static rethrow(err: any, code?: string): void;
    static init(name: string, code): void;
}

export class TimeoutError extends CanceledError {
    constructor(message: string);
    constructor(timeout: number);
}

export class AxiosPromise <R> implements Thenable <R> {
    constructor (callback: (resolve : (value?: R | Thenable<R>) => void, reject: (error?: any) => void) => void, options?: AxiosPromiseOptions);
    then <U> (onFulfilled?: (value: R, scope: AxiosPromise<U>) => U | Thenable<U>, onRejected?: (error: any, scope: AxiosPromise<U>) => U | Thenable<U>): AxiosPromise<U>;
    then <U> (onFulfilled?: (value: R, scope: AxiosPromise<U>) => U | Thenable<U>, onRejected?: (error: any, scope: AxiosPromise<U>) => void): AxiosPromise<U>;
    catch <U> (onRejected?: (error: any, scope: AxiosPromise<U>) => U | Thenable<U>): AxiosPromise<U>;
    finally<U = any> (onFinally?: ({value: U, status: SettledStatus}, scope: AxiosPromise<U>) => any | Thenable<any>): AxiosPromise<R>;
    atomic<U = any>(mode?: AtomicMode): AxiosPromise<U>;
    timeout<U = any>(ms: number): AxiosPromise<U>;
    listen<U = any>(signal: GenericAbortSignal): AxiosPromise<U>;
    cancel(reason?: any): boolean;
    onCancel(reason: CanceledError): void;
    readonly signal: GenericAbortSignal;
    static resolve (): AxiosPromise<void>;
    static resolve <R> (value: R | Thenable<R>, options?: AxiosPromiseResolveOptions): AxiosPromise<R>;
    static reject <R> (error: any): AxiosPromise<R>;
    static atomic <R> (value: any | Thenable<R>, mode?: AtomicMode): AxiosPromise<R>;
    static all<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10>(values: [T1 | Thenable<T1>, T2 | Thenable<T2>, T3 | Thenable<T3>, T4 | Thenable <T4>, T5 | Thenable<T5>, T6 | Thenable<T6>, T7 | Thenable<T7>, T8 | Thenable<T8>, T9 | Thenable<T9>, T10 | Thenable<T10>]): AxiosPromise<[T1, T2, T3, T4, T5, T6, T7, T8, T9, T10]>;
    static all<T1, T2, T3, T4, T5, T6, T7, T8, T9>(values: [T1 | Thenable<T1>, T2 | Thenable<T2>, T3 | Thenable<T3>, T4 | Thenable <T4>, T5 | Thenable<T5>, T6 | Thenable<T6>, T7 | Thenable<T7>, T8 | Thenable<T8>, T9 | Thenable<T9>]): AxiosPromise<[T1, T2, T3, T4, T5, T6, T7, T8, T9]>;
    static all<T1, T2, T3, T4, T5, T6, T7, T8>(values: [T1 | Thenable<T1>, T2 | Thenable<T2>, T3 | Thenable<T3>, T4 | Thenable <T4>, T5 | Thenable<T5>, T6 | Thenable<T6>, T7 | Thenable<T7>, T8 | Thenable<T8>]): AxiosPromise<[T1, T2, T3, T4, T5, T6, T7, T8]>;
    static all<T1, T2, T3, T4, T5, T6, T7>(values: [T1 | Thenable<T1>, T2 | Thenable<T2>, T3 | Thenable<T3>, T4 | Thenable <T4>, T5 | Thenable<T5>, T6 | Thenable<T6>, T7 | Thenable<T7>]): AxiosPromise<[T1, T2, T3, T4, T5, T6, T7]>;
    static all<T1, T2, T3, T4, T5, T6>(values: [T1 | Thenable<T1>, T2 | Thenable<T2>, T3 | Thenable<T3>, T4 | Thenable <T4>, T5 | Thenable<T5>, T6 | Thenable<T6>]): AxiosPromise<[T1, T2, T3, T4, T5, T6]>;
    static all<T1, T2, T3, T4, T5>(values: [T1 | Thenable<T1>, T2 | Thenable<T2>, T3 | Thenable<T3>, T4 | Thenable <T4>, T5 | Thenable<T5>]): AxiosPromise<[T1, T2, T3, T4, T5]>;
    static all<T1, T2, T3, T4>(values: [T1 | Thenable<T1>, T2 | Thenable<T2>, T3 | Thenable<T3>, T4 | Thenable <T4>]): AxiosPromise<[T1, T2, T3, T4]>;
    static all<T1, T2, T3>(values: [T1 | Thenable<T1>, T2 | Thenable<T2>, T3 | Thenable<T3>]): AxiosPromise<[T1, T2, T3]>;
    static all<T1, T2>(values: [T1 | Thenable<T1>, T2 | Thenable<T2>]): AxiosPromise<[T1, T2]>;
    static all<T1>(values: [T1 | Thenable<T1>]): AxiosPromise<[T1]>;
    static all<TAll>(values: Array<TAll | Thenable<TAll>>): AxiosPromise<TAll[]>;
    static race <R> (promises: (R | Thenable<R>)[]): AxiosPromise<R>;
    static allSettled <R> (promises: (R | Thenable<R>)[]): AxiosPromise<R>;
    static delay<R = any> (ms: number): AxiosPromise<R>;
    static isAxiosPromise(thing: any): boolean;
    static isCanceledError(thing: any): boolean;
    static readonly CanceledError: typeof CanceledError;
    static readonly TimeoutError: typeof TimeoutError;
    static promisify(thing: GeneratorFunction, options?: PromisifyOptions): boolean;
}

export class AxiosPromiseSync <R> extends AxiosPromise <R> {}
