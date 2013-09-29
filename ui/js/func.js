function VineCtrl($scope) {
    $scope.vines = [];
    $scope.playlistName= [];
    
    $scope.addPlaylistName = function() {
	console.log("add playlistname");
	$scope.playlistName.push({text:$scope.playlistName});
    }

    $scope.toggle = function(vine) {
	console.log("toggle");
	var i=0;
	while ($scope.vines[i]['$$hashKey'] !== vine['$$hashKey']) {

	    i++;
	}
	$scope.vines[i].notRemoved = !($scope.vines[i].notRemoved);
	console.log("this should be the one " + $scope.vines[i].text + " not removed: " + $scope.vines[i].notRemoved);
	console.log("because it matches " + vine.text + " not removed: " + vine.notRemoved);

	
	var oldVines = $scope.vines;
	$scope.vines = [];
	angular.forEach(oldVines, function(vine) {
	    if (vine.notRemoved) $scope.vines.push(vine);
	});
    };

    $scope.addVine = function() {
	console.log("angular add = " + $scope.vineLink);
	if(!$scope.vineitize($scope.vineLink)) {
	    console.log("failed url");
	    return;
	}
	$scope.vines.push({text:$scope.vineLink, notRemoved:true});
    };

    $scope.vineitize = function(url) {
	var parts = url.split("/");	
	if (parts[0] !== "https:") {
	    return false;
	}
	if (parts[2] !== "vine.co") {
	    return false;
	}
	if (parts[3] !== "v") {
	    return false;
	}
	if (parts[4].length !== 11) {
	    return false;
	}
	return true;
    }

    $scope.checkFail = function(url) {
	$.ajax({
	    type: "POST",
	    datatype: 'jsonp',
	    url: url,
	    success: function(data) {},
	    error: function(data) {
		console.log(data);
	    },
	});
    }

    $scope.save = function() {
	var outString = "";
	console.log($scope.playlistName);
	console.log("\nlength = " + $scope.vines.length);
	for (var i=0; i<$scope.vines.length; i++) {
	    var test = $scope.checkFail($scope.vines[i].text);
	    if (test == false) { console.log("no real vine @ " + $scope.vines[i].text);  }
	    console.log($scope.vines[i]);
	    outString += (($scope.vines[i].text).split("/"))[4];
	}
	console.log("outstring = " + outString);
	    
	$.ajax({
	    type: "POST",
	    url: "http://fidler.io/save",
	    data: "vines="+outString,
	    success: function(data) {
		console.log("response");
		console.log(data);
	    },
	    error: function(data) {
		console.log("error: " + data);
	    }
	});
	console.log("save");
    }

}
