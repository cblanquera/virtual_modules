import { EventEmitter } from '@inceptjs/types';
import VirtualModule from './VirtualModule';

/**
 * Module holds `Module._resolveFilename()` which is where all `require()` goes
 * to find out where the actual file is located
 */
import Module from 'module';

/**
 * Allows to define how a virtual module gets loaded when a user does
 * `require('something')` instead of having multiple points where the
 * `Module._resolveFilename()` is wrapped, this class is a single point
 * where it is wrapped then triggering an event when `require()` is used.
 * This class should be instantiated using `RequireResolver.load()` to
 * enforce a static class pattern because `require()` is heavily used so
 * we shouldn't be wrapping this more than once.
 */
class RequireResolver extends EventEmitter {
  /**
   * The original Module._resolveFilename()
   */
  original: Function;

  /**
   * Remember the original _resolveFilename()
   */
  constructor() {
    super();
    //@ts-ignore
    this.original = Module._resolveFilename;
  }

  /**
   * Starts listening to `require()`
   */
  listen(): RequireResolver {
    //@ts-ignore
    Module._resolveFilename = this.resolve.bind(this);
    return this;
  }

  /**
   * Resolve callback for Module._resolveFilename
   *
   * @param request - the request string; may not be an absolute path
   * @param parent - the parent object from the `require.cache`
   */
  resolve(request: string, parent: Module) {
    //try to resolve
    const virtualModule = new VirtualModule;
    this.emit('resolve', request, virtualModule, parent);

    if (virtualModule.error instanceof Error) {
      throw virtualModule.error;
    }

    //if its not resolved
    if (!virtualModule.isResolved()) {
      //business as usual
      return this.original.call(Module, request, parent);
    }

    const { filename, module } = virtualModule;

    //if it's not cached
    if (filename && module && !require.cache[filename]) {
      require.cache[filename] = module;
    }

    //redirect them to our cached version
    return filename;
  }

  /**
   * Puts back the original _resolveFilename
   */
  revert(): RequireResolver {
    //@ts-ignore
    Module._resolveFilename = this.original;
    return this;
  }
}

//make sure this cannot be instantiated again
export default new RequireResolver;

//additional exports
export { VirtualModule };
