import VirtualModules, { VirtualModule } from './VirtualModules';

//there can only be one.
module.exports = new VirtualModules;
module.exports.default = module.exports;
module.exports.VirtualModule = VirtualModule;
