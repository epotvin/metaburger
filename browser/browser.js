/* global _ */
define(function(require, exports, module) {
    main.consumes = ["Panel", "Tree", "vfs", "Menu", "MenuItem", "metaburger", "metaburger.menu"];
    main.provides = ["metaburger.browser"];
    return main;

    function main(options, imports, register) {
        var Panel = imports.Panel;
        var Tree = imports.Tree;
        var vfs = imports.vfs;
        var Menu = imports.Menu;
        var MenuItem = imports.MenuItem;
        var menu = imports['metaburger.menu'];
        
        var metaburger = imports.metaburger;

        var plugin = new Panel("epotvin", main.consumes, {
            index: options.index || 100,
            caption: "Meta Browser",
            minWidth: 130,
            where: options.where || "left"
        });

        var container, tree;

        plugin.on("load", function() {});

        plugin.on("draw", function(e) {

            container = e.aml;

            tree = new Tree({
                container: container.$int,
                getIconHTML: getIconHTML,
                getCaptionHTML: getCaptionHTML,
                getChildren: getChildren,
                hasChildren: hasChildren
            }, plugin);

            tree.on('userSelect', function() {
                var element;
                if (tree.selectedNodes[0]) {
                    element = tree.selectedNodes[0].element;
                }
                metaburger.select(element);
            });

            container.$int.addEventListener("contextmenu", function(e) {
                menu.getMenu(metaburger.selected).show(e.x, e.y);
                e.preventDefault();
                return false;
            }, false);

            reloadModel();

            metaburger.on('loaded', reloadModel);
        });

        plugin.on("unload", function() {
            tree.unload();
            menu.unload();
            container = null;
        });

        function reloadModel() {
            var root = {
                children: []
            };

            root.children.push({
                label: "m3",
                path: "!domains",
                isOpen: true,
                className: "heading",
                isRoot: true,
                isFolder: true,
                status: "loaded",
                map: {},
                children: [],
                noSelect: true,
                $sorted: true
            });

            _.each(metaburger.models, function(model) {
                root.children.push(getNodeFromElement(model));
                model.on('changed', function(e) {
                    tree.refresh(true);
                });

            });

            tree.setRoot(root);
        }

        function getIconHTML(node) {
            if (node.element) {
                var iconPath = node.element.instanceOf.getIcon();
                var url = vfs.url(iconPath);
                return '<span class="ace_tree-icon" style="background-image: url(' + url + ')"></span>';
            }
            return '';
        }

        function getCaptionHTML(node) {
            return node.element ? node.element.name : node.label;
        }

        function getChildren(node) {
            if (!node.children && node.element) {
                var children = [];
                _.each(node.element.instanceOf.getAllAttributes(), function(attribute) {
                    if (node.element.get(attribute) && attribute.composition && !attribute.type.isInstanceOf('core.type.Type')) {
                        if (attribute.multiple) {
                            children = children.concat(_.map(node.element.get(attribute), getNodeFromElement));
                        }
                        else {
                            children.push(getNodeFromElement(node.element(attribute)));
                        }
                    }
                });
                node.children = children;
            }

            if (node.children && node.children[0]) {
                var d = (node.$depth + 1) || 0;
                node.children.forEach(function(n) {
                    n.$depth = d;
                    n.parent = node;
                });
            }

            return node.children;
        }

        function hasChildren(node) {
            if (node.children && node.children[0]) {
                return true;
            }
            if (!node.element) {
                return false;
            }
            var hasChildren = false;
            _.each(node.element.instanceOf.getAllAttributes(), function(attribute) {
                if (node.element.get(attribute) && attribute.composition && !attribute.type.isInstanceOf('core.type.Type')) {
                    if (!attribute.multiple || node.element.get(attribute.name)[0]) {
                        hasChildren = true;
                    }
                }
            });
            return hasChildren;
        }

        function getNodeFromElement(element) {
            return {
                label: element.name,
                isFolder: element.elements && element.elements.length > 0,
                element: element
            };
        }

        register(null, {
            "metaburger.browser": plugin
        });

    }
});