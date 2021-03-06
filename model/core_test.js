define(function(require, exports, module) {
    main.consumes = ["plugin.test", "core"];
    main.provides = [];
    return main;

    function main(options, imports, register) {
        var test = imports["plugin.test"];
        var core = imports.core;

        var describe = test.describe;
        var it = test.it;
        var assert = test.assert;

        describe(core.name, function(){
            it('has some classes', function() {
                assert(core.Class);
            });
        });

        register(null, {});
    }
});