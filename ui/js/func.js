function VineCtrl($scope) {
    $scope.vines = [];

    $scope.addVine = function() {
	console.log("angular add");
	$scope.vines.push({text:$scope.vineLink, removed:false});
    };

    $scope.save = function() {
	console.log("save");
    }

}
