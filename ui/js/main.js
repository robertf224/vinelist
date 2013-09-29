var Main = Main || new function() {
    
    this.hashes = "";
    this.hashArray = ["bgep05eMY3l", "hhrWdw3FJx3"];

    this.populateHashArray = function (uid) {
	$.ajax({
	    type:"GET",
	    url: "http://fidler.io/p/"+uid+"/string",
	    success: function(data) {
		console.log("success "+data);
		var k=0;
		for (var i=11; i<data.length; i=i+11) {
		    Main.hashArray[k] = data.substring(i-11, i-1);
		    k++:
		}
	    },
	    error: function(data) {
		console.log("fail = " + data);
	    }
	});
    };

    this.currHashValue = 0;


    this.nextVideo = function() {
	Main.currHashValue = Main.currHashValue + 1;  
	if (Main.currHashValue >= Main.hashArray.length) { 
	    Main.currHashValue = 0;
	}
	console.log("next");
	var newsource = "https://vine.co/v/"+Main.hashArray[Main.currHashValue]+"/embed/simple";
	console.log(newsource);
	$('.vine-embed').attr('src', newsource);
    }

    this.previousVideo = function() {
	Main.currHashValue = Main.currHashValue - 1;  
	if (Main.currHashValue < 0) { 
	    Main.currHashValue = Main.hashArray.length-1;
	}
	console.log("prev");
	var newsource = "https://vine.co/v/"+Main.hashArray[Main.currHashValue]+"/embed/simple";
	console.log(newsource);
	$('.vine-embed').attr('src', newsource);
    }

    var linkCount = 0;
    /*
     * add vines to 'vines-to-add' class
     */
    function vinesToAdd(url) {
	var tempURL = url;
	var tempHTML = $('.vines-to-add').html();		
	console.log(tempHTML);		

	console.log("<li class='vine-list-item'>"+tempURL+"<button class='delete' id='delete-"+linkCount+"'>X</button></li>");
	$('.vines-to-add').append("<li class='vine-list-item'>"+tempURL+"<button class='delete-"+linkCount+">X</button></li>").hide().fadeIn().slideDown('slow');
	addDeleteListener(linkCount);
	linkCount++;
    }
	
    function addDeleteListener(count) {
	$('.delete-'+count+'').click(function() {
	console.log("delete list item");
	    removeListItem(count);
	});
    }


    /*
     * issues XHR request to save playlist
     */
    function savePlaylist() {
	var vinehashes = [];
    }

    /*
     *
     */
    function removeListItem() {
    }

    //dom ready
    $(function() {

	$.ajax ({
	    type:"GET",
	    datatype:"jsonp",
	    data: {},
	    url:"https://vine.co/v/"+Main.hashArray[Main.currHashValue]+"",
	    success: function(data) {
		console.log(data);
	    },
	    error: function(data) {
		console.log("shits fucked " + JSON.stringify(data));
	    }
	    
	});


	$('#add-vine').click(function() {
	    vinesToAdd($('#create-playlist-link').val());   
	});

	$('.save-button').click(function() {
	    savePlaylist();	    
	});

	$('.nav-buttons #prev').click(function() {
	    Main.previousVideo();
	});

	$('.nav-buttons #next').click(function() {
	    console.log("next listener");
	    Main.nextVideo();
	});

    });
}
