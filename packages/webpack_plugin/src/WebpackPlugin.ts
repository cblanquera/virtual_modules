import vm from 'virtual_modules';

export default class VirtualModulesWebpackPlugin {
  /**
   * Source
   */
  public source: string;

  /**
   * Target
   */
  public target: string;

  /**
   * Sets the source and the target
   */
	constructor(source: string = 'resolve', target: string = 'vmResolve') {
		this.source = source;
		this.target = target;
	}

  /**
   * Resolves
   */
	apply(resolver: any) {
		const target = resolver.ensureHook(this.target);
		resolver
			.getHook(this.source)
			.tapAsync('VirtualModulesWebpackPlugin', (
        request: Record<string, any>, 
        resolveContext: Record<string, any>, 
        callback: Function
      ) => {
        if (!request.request) {
          return callback();
        }

        const pathname = vm.resolvePath(request.request as string);

        if (!pathname) {
          return callback();
        }

        const results = { ...request, request: pathname };
        const descriptor = `using virtual_modules file: ${results.request}`;
				resolver.doResolve(target, request, descriptor, resolveContext, callback);
			});
	}
}