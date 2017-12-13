/*
	@version 0.1.8
	https://github.com/vgrigory/angular.treeview

	@version 0.1.7
	https://github.com/smolk/angular.treeview

	@fork from:
	@license Angular Treeview version 0.1.6
	ⓒ 2013 AHN JAE-HA http://github.com/eu81273/angular.treeview
	License: MIT


	[TREE attribute]
	angular-treeview: the treeview directive
	tree-id: each tree's unique id.
	tree-model: the tree model on $scope.
	node-id: each node's id
	node-label: each node's label
	node-children: each node's children
 	node-filter: free text to search in tree nodes
 	node-isfolder: mark node as folder (make it not selectable)
 	data-hide-disabled-nodes: true by default, if false - disabled
 	(disabled: true | disabled == 'disabled') nodes will be shown grayed and non selectable

	<div
		data-angular-treeview="true"
		data-tree-id="tree"
		data-tree-model="roleList"
		data-node-id="roleId"
		data-node-label="roleName"
		data-node-children="children"
 		data-node-filter="freeTextSearch"
 		data-node-isfolder="isfolder"
 		data-hide-disabled-nodes="boolean"
    >
	</div>
*/

(function ( angular ) {
	'use strict';

	angular.module( 'angularTreeview', [] )
		.directive( 'treeModel', ['$compile', '$log', '$timeout', function( $compile, $log, $timeout ) {
			var KEY_ENTER = 13;
			var KEY_LEFT_ARROW = 37;
			var KEY_UP_ARROW = 38;
			var KEY_RIGHT_ARROW = 39;
			var KEY_DOWN_ARROW = 40;
		return {
			restrict: 'A',
			link: function ( scope, element, attrs ) {
				//tree id
				var treeId = attrs.treeId;
				var treeIdPrefix = treeId ? treeId + '.' : '';
			
				//tree model
				var treeModel = attrs.treeModel;

				//node id
				var nodeId = attrs.nodeId || 'id';

				//node label
				var nodeLabel = attrs.nodeLabel || 'label';

				//children
				var nodeChildren = attrs.nodeChildren || 'children';

				//isfolder
				var isFolder = attrs.nodeIsfolder || 'isfolder';

				//filter

				var nodeFilter =attrs.nodeFilter || '';
				var filter = nodeFilter!=='' ? ' | filter:searchTree(this)' : '';
				var highlight_filter = nodeFilter!=='' ? ' | nodehighlight: ' + nodeFilter : '';
				//tree template
				var template =
					'<ul>' +
						'<li ng-hide="node.disabled" data-ng-repeat="node in ' + treeModel + filter + '">' +
							'<a href="" class="nodewrap" ng-class="{activenode: node.'+ nodeId + ' == ' + treeIdPrefix + 'currentNode.' + nodeId +' && !!node.'+ nodeId + ', disablednode: node.disabled}"><i class="collapsed" data-ng-show="' + treeIdPrefix + 'shouldRenderAsFolder(node) && node.collapsed" data-ng-click="' + treeIdPrefix + 'selectNodeHead(node)"></i>' +
							'<i class="expanded" data-ng-show="' + treeIdPrefix + 'shouldRenderAsFolder(node) && !node.collapsed" data-ng-click="' + treeIdPrefix + 'selectNodeHead(node)"></i>' +
							'<i class="normal" data-ng-hide="' + treeIdPrefix + 'shouldRenderAsFolder(node)"></i> ' +
							'<span class="node_title" data-ng-click="' + treeIdPrefix + 'selectNodeLabel(node)" ng-bind-html="node.' + nodeLabel + highlight_filter+'"></span></a>' +
							'<div ng-if="!node.collapsed" data-ng-hide="node.collapsed" ' + (treeId ? 'data-tree-id="' + treeId + '"' : '') + ' data-tree-model="node.' + nodeChildren + '" data-node-id=' + nodeId + ' data-node-label=' + nodeLabel + ' data-node-children=' + nodeChildren + ' data-node-filter="'+ nodeFilter +'"></div>' +
						'</li>' +
					'</ul>';


				//check tree id, tree model
				if( treeModel ) {
					//root node
					if( attrs.angularTreeview ) {


						//create/link tree object if not exists
						var treeObject = scope;
						if (treeId) {
							treeObject = scope[treeId] = scope[treeId] || {};
						}

                        treeObject.shouldRenderAsFolder = function (node) {
                            var i;
                            var nodeChildrenLength = node[nodeChildren] ? node[nodeChildren].length : 0;
                            var emptyFolder = true;

                            for (i = 0; i < nodeChildrenLength; i++) {
                                if (!node[nodeChildren][i].disabled) {
                                    emptyFolder = false;
                                    break;
                                }
                            }

                            return (node[isFolder] || node[nodeChildren].length) && !emptyFolder;
                        }

						//if node head clicks,
						treeObject.selectNodeHead = treeObject.selectNodeHead || function( selectedNode ){
						    if (selectedNode.disabled ) {
						        return;
						    }
							//Collapse or Expand
							selectedNode.collapsed = !selectedNode.collapsed;
						};

						//if node label clicks,
						treeObject.selectNodeLabel = treeObject.selectNodeLabel || function( selectedNode ){
                            if (selectedNode.disabled ) {
						        return;
						    }

							if (selectedNode[isFolder]) {
								return treeObject.selectNodeHead(selectedNode);
							}

							//remove highlight from previous node
							if( treeObject.currentNode && treeObject.currentNode.selected ) {
								treeObject.currentNode.selected = undefined;
							}

							//set highlight to selected node
							selectedNode.selected = 'selected';

							//set currentNode
							treeObject.currentNode = selectedNode;
						};

						if (nodeFilter) {
							scope.$watch(nodeFilter, function(next, prev){
								if (!next && !prev) {return}
								expandAll(scope[treeModel], !next);
							});

						}
					}

					//Rendering template.
					element.html('').append( $compile( template )( scope ) );
				}


				function expandAll(items, collapse){
					for (var i=0; i<items.length; i++) {
						items[i].collapsed = !!collapse;
						if (typeof items[i][nodeChildren] !== 'undefined' && items[i][nodeChildren].length > 0) {
							expandAll(items[i][nodeChildren]);
						}
					}
				}

				function moveRight(e){
					if (angular.element(e).find('i.collapsed:not(.ng-hide)').length) {
						$timeout(function() {
							angular.element(e).find('i.collapsed:not(.ng-hide)').first().triggerHandler('click');
						});
					} else {
						moveDown(e);
					}

				}

				function moveLeft(e){
					var parents = angular.element(e).parentsUntil(angular.element('[data-angular-treeview]'), 'li');
					if (parents.length > 1) {
						angular.element(parents[1]).find('a').first().focus();
						return angular.element(parents[1]).find('a').first();
					}
				}

				function moveDown(e, bSkipDownTree){
					if (angular.element(e).find('i.expanded:not(.ng-hide)').length && !bSkipDownTree && angular.element(e).parent().find('ul a').length) {
						angular.element(e).parent().find('ul a').first().focus();
						return;
					}
					if (!angular.element(e).parent().next('li').length) {
						var parent = moveLeft(e);
						if (parent) { moveDown(parent, true) }
					} else {
						angular.element(e).parent().next('li').find('a').first().focus();
					}
				}

				function moveUp(e){
					if (!angular.element(e).parent().prev('li').length) {
						moveLeft(e)
					} else {
						angular.element(e).parent().prev('li').find('a').first().focus();
					}
				}

				function clickOnNode(e){
					$timeout(function() {
						angular.element(e).find('.node_title').first().triggerHandler('click');
					});
				}

				function collapseNode(e){
					if (angular.element(e).find('i.expanded:not(.ng-hide)').length) {
						$timeout(function() {
							angular.element(e).find('i.expanded:not(.ng-hide)').first().triggerHandler('click');
						});
						return true;
					}
					return false;

				}

				scope.onKeyPress = function(event){
					if (event.keyCode == KEY_RIGHT_ARROW) {
						moveRight(event.target);
						event.preventDefault();
					}

					if (event.keyCode == KEY_DOWN_ARROW) {
						moveDown(event.target);
						event.preventDefault();
					}

					if (event.keyCode == KEY_UP_ARROW) {
						moveUp(event.target);
						event.preventDefault();
					}

					if (event.keyCode == KEY_LEFT_ARROW) {
						if (collapseNode(event.target)) {
							return;
						}
						var parent = moveLeft(event.target);
						if (parent) {
							collapseNode(parent);
						} else {
							moveUp(event.target);
						}
						event.preventDefault();
					}

					if (event.keyCode == KEY_ENTER) {
						clickOnNode(event.target);
						event.preventDefault();
					}
				}
			}
		};
	}])
		.filter('nodehighlight', function () {
			return function (text, search) {
				if (search && text) {
					text = text.toString().replace(new RegExp(search.toString(), 'gi'), '<span class="node_highlight">$&</span>');
					return text;
				}
				return text;
			};
		});
})( angular );
