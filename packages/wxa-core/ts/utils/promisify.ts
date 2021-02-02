type Fn<T> = T extends Record<string, any>
  ? (options: Omit<T, 'success' | 'fail' | 'complete'>) => Promise<Parameters<T['success']>[0]>
  : never;

export default function promisify<T>(api: (options: T) => any): Fn<T> {
    return ((options: any, ...params) => 
        new Promise((resolve, reject) => {
            api(Object.assign({}, options, {success: resolve, fail: reject}), ...params);
        })) as Fn<T>;
}
