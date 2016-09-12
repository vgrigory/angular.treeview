/*
	@version 0.1.6
	https://github.com/smolk/angular.treeview

	@fork from:
	@license Angular Treeview version 0.1.6
	ⓒ 2013 AHN JAE-HA http://github.com/eu81273/angular.treeview
	License: MIT


	[TREE attribute]
	angular-treeview: the treeview directive
	tree-id : each tree's unique id.
	tree-model : the tree model on $scope.
	node-id : each node's id
	node-label : each node's label
	node-children: each node's children
 	node-filter: free text to search in tree nodes

	<div
		data-angular-treeview="true"
		data-tree-id="tree"
		data-tree-model="roleList"
		data-node-id="roleId"
		data-node-label="roleName"
		data-node-children="children"
 		data-node-filter="freeTextSearch">
	</div>
*/

(function ( angular ) {
	'use strict';

	angular.module( 'angularTreeview', [] )
		.directive( 'treeModel', ['$compile', '$log', function( $compile, $log ) {
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

				//filter
				var nodeFilter =attrs.nodeFilter || '';
				var filter = nodeFilter!=='' ? ' | nodefilter: ' + nodeFilter : '';

				//tree template
				var template =
					'<ul>' +
						'<li data-ng-repeat="node in ' + treeModel + filter + '">' +
							'<i class="collapsed" data-ng-show="node.' + nodeChildren + '.length && node.collapsed" data-ng-click="' + treeIdPrefix + 'selectNodeHead(node)"></i>' +
							'<i class="expanded" data-ng-show="node.' + nodeChildren + '.length && !node.collapsed" data-ng-click="' + treeIdPrefix + 'selectNodeHead(node)"></i>' +
							'<i class="normal" data-ng-hide="node.' + nodeChildren + '.length"></i> ' +
							'<span data-ng-class="node.selected" data-ng-click="' + treeIdPrefix + 'selectNodeLabel(node)">{{node.' + nodeLabel + '}}</span>' +
							'<div data-ng-hide="node.collapsed" ' + (treeId ? 'data-tree-id="' + treeId + '"' : '') + ' data-tree-model="node.' + nodeChildren + '" data-node-id=' + nodeId + ' data-node-label=' + nodeLabel + ' data-node-children=' + nodeChildren + '></div>' +
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

						//if node head clicks,
						treeObject.selectNodeHead = treeObject.selectNodeHead || function( selectedNode ){
							//Collapse or Expand
							selectedNode.collapsed = !selectedNode.collapsed;
						};

						//if node label clicks,
						treeObject.selectNodeLabel = treeObject.selectNodeLabel || function( selectedNode ){
							if (selectedNode.isFolder) {
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
					}

					//Rendering template.
					element.html('').append( $compile( template )( scope ) );

				}
			}
		};
	}])
		.filter('nodefilter', ['$filter', function($filter){
			var stdFilter = $filter('filter');
			return function(input, nodefilter){
				var res = stdFilter(input, nodefilter);
				if (!!nodefilter && res.length > 0) {
					angular.forEach(res, function(item){item.collapsed = false;});
				}
				return res;
			}
		}]);
})( angular );
