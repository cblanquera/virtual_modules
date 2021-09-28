import Module from 'module';

/**
 * File Resolve is an abstract to describe how to resolve a file request from
 * `@require(file)`. You just simply need to set the exports.
 */
 export default class VirtualModule {
  /**
   * The file code
   */
  protected _code: string|null = null;
  
  /**
   * The compile error
   */
  protected _error: Error|null = null;

  /**
   * The string file absolute path
   */
  protected _filename: string|null = null;
  
  /**
   * The node module instance
   */
  protected _module: Module|null = null;
  
  /**
   * The parent node module instance
   */
  protected _parent: Module|null = null;

  /**
   * Returns the code
   */
  get code(): string|null {
    return this._code;
  }

  /**
   * Returns the compile error if any
   */
  get error(): Error|null {
    return this._error;
  }

  /**
   * Returns the absolute filename
   */
  get filename(): string|null {
    return this._filename;
  }

  /**
   * Returns the node module instance
   */
  get module(): Module|null {
    return this._module;
  }

  /**
   * Returns the parent node module instance
   */
  get parent(): Module|null {
    return this._parent;
  }

  /**
   * Compiles the given code and sets the file meta
   */
  compile(code: string, filename: string, parent: Module): VirtualModule {
    //populate module
    this._code = code;
    this._parent = parent;
    this._filename = filename;
 
    //@ts-ignore
    const module = new Module(filename, parent);
    module.filename = filename;

    //add node paths
    //@ts-ignore
    module.paths = require.main.paths;

    try {
      //@ts-ignore
      module._compile(code, filename);
    } catch(e) {
      this._error = e as Error;
      return this;
    }

    if (parent && parent.children) {
      parent.children.splice(parent.children.indexOf(module), 1);
    }

    this._module = module;

    return this;
  }

  /**
   * Returns true if resolved
   */
  isResolved(): boolean {
    return this.module instanceof Module;
  }
}

//custom interfaces and types