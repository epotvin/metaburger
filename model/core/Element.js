/* global _ */
define(function(require, exports, module) {
    "use strict";
    class Element {
        constructor(name, model) {
            this.name = name;
            this.model = model;
        }
        
        isInstanceOf(clazz) {
            return this.instanceOf.is(clazz);
        }
        
        getLabel(attribute) {
            if (!attribute) return this.name;
            if (attribute.type.isInstanceOf(this.model.elements['core.type.Type'])) {
                return this[attribute.name];
            }
            if (attribute.multiple) {
                return '[' + _.reduce(this[attribute.name], function(memo, attribute) {
                    if (memo.length > 0) {
                        memo += ', ';
                    }
                    return memo += attribute.name;
                }, '') + ']';
            }
            else {
                return this[attribute.name] ? this[attribute.name].name : null;
            }
        }
    }
    module.exports = Element;
});