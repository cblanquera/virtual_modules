//import fs from 'fs';
import path from 'path';
import Module from 'module';

import Exception from './Exception';
import VirtualModule from './VirtualModule';
import requireResolver from './RequireResolver';

//`cwd` is where this package was called from
const cwd = process.cwd();

/**
 * The main engine that processes and routes virtual files to webpack, and require
 */
export default class VirtualModules {
  /**
   * Mapping of destination to source
   */
  protected _registry: Record<string, string|Function> = {};

  /**
   * Mapping of regex to trans
   */
  protected _transformations: Transformer[] = [];

  /**
   * Returns the virtual registry
   */
  get registry(): Record<string, string|Function> {
    return Object.assign({}, this._registry);
  }

  /**
   * Returns the virtual registry without functions
   */
  get safeRegistry(): Record<string, string|Function> {
    const registry: Record<string, string> = {};
    for (const filename in this._registry) {
      if (typeof this._registry[filename] === 'string') {
        registry[filename] = this._registry[filename] as string;
      }
    }

    return registry;
  }

  /**
   * Sets up the require resolver
   */
  constructor() {
    requireResolver.on('resolve', this._resolve.bind(this));
  }

  /**
   * Registers a new virtual module. Can be the module name or file
   */
  public register(
    destination: string, 
    source: string|Function
  ): VirtualModules {
    Exception.require(
      typeof destination === 'string', 
      'Argument 1 expecting string path'
    );

    Exception.require(
      typeof source === 'string' || typeof source === 'function', 
      'Argument 2 expecting string code or Function'
    );
    this._registry[this.resolve(destination)] = source;
    return this;
  }

  /**
   * Resolves relative paths to absolute ones
   */
  public resolve(filename: string, pwd: string = cwd): string {
    Exception.require(
      typeof filename === 'string', 
      'Argument 1 expecting string path'
    );

    Exception.require(
      typeof pwd === 'string', 
      'Argument 2 expecting string path'
    );
    //absolute
    if (filename.indexOf('/') === 0) {
      filename = path.join(filename);
    //relative
    } else if (filename.indexOf('./') === 0) {
      filename = path.join(pwd, filename.substr(1));
    //dirname
    } else if (filename.indexOf('../') === 0) {
      filename = path.join(pwd, '..', filename.substr(2));
    //node_modules
    } else {
      filename = path.join(cwd, 'virtual_modules', filename);
    }

    //look for filename.js
    if (this._registry[`${filename}.js`]) {
      filename = `${filename}.js`;
    //look for filename/index.js
    } else if (this._registry[`${filename}/index.js`]) {
      filename = `${filename}/index.js`;
    }
    
    return path.normalize(filename);
  }

  /**
   * Registers a transformer
   */
  public rule(test: RegExp|Function, callback: Function): VirtualModules {
    Exception.require(
      typeof test === 'function' || test instanceof RegExp, 
      'Argument 1 expecting RegExp or Function'
    );

    Exception.require(
      typeof callback === 'function', 
      'Argument 2 expecting Function'
    );
    this._transformations.push({ test, callback });
    return this;
  }

  /**
   * Starts the RequireResolver
   */
  public start(): VirtualModules {
    requireResolver.listen();
    return this;
  }

  /**
   * Stops the RequireResolver
   */
  public stop(): VirtualModules {
    requireResolver.revert();
    return this;
  } 

  /**
   * Processes all the matching transformers onto the code
   */
  transform(destination: string, code: string): string {
    for (const transformer of this._transformations) {
      const valid = typeof transformer.test === 'function' 
        ? transformer.test(destination)
        : transformer.test.test(destination);
      
      if(valid) {
        const transformed = transformer.callback(destination, code);
        if (typeof transformed === 'string') {
          code = transformed;
        }
      }
    }
    return code;
  }

  /**
   * Normalizes how code is retrieved and attempts to transforms it
   */
  protected _code(
    request: string, 
    destination: string,
    code: any, 
    callback: Function
  ) {
    //if it's a function
    if (typeof code === 'function') {
      //call it
      code = code(request, destination, cwd, this);
    }

    //if code is not a string
    if (typeof code !== 'string') {
      return callback(null);
    }

    //transform the code
    return callback(this.transform(destination, code));
  }

  /**
   * Require resolver for registered files
   */
  protected _resolve(
    request: string, 
    module: VirtualModule, 
    parent: Module
  ) {
    if (module.isResolved()) {
      return;
    }

    const destination = this.resolve(request, parent.path);
    const process = (code: string|null) => {
      if (typeof code === 'string') {
        module.compile(code, destination, parent);
      }
    };
    //if it's in the registry
    if (this._registry[destination]) {
      this._code(
        request, 
        destination, 
        this._registry[destination], 
        process
      );
    } else {
      //loop through the destinations
      for (const filename in this._registry) {
        //if the destination prefixes the request
        if (destination.indexOf(`${filename}/`) === 0) {
          this._code(
            request, 
            destination, 
            this._registry[filename], 
            process
          );
        }
      }
    }
  }
}

//additional exports
export {
  requireResolver,
  VirtualModule
};

export type Transformer = {
  test: RegExp|Function;
  callback: Function;
}
