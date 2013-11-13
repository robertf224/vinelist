var Main = Main || new function() {

	this.getPlaylistID = function() {
		var temparr= (window.location.pathname).split("/");
		return temparr[2];
}
    
    this.hashes = "";
    //this.hashArray = ["bgep05eMY3l", "hhrWdw3FJx3"];
    this.hashArray = [];
		this.hashString = "";

    this.populateHashArray = function (uid) {
	var tempURLArray = uid.split("/");
	console.log(tempURLArray[tempURLArray.length-1]);
	uid = tempURLArray[tempURLArray.length-1];

	$.ajax({
	    type:"GET",
	    url: "http://vinelist.co/p/"+uid+"/string",
	    success: function(data) {
		Main.hashArray = [];
		console.log("success "+data);
		var length = data.length/11;
		for (var i=0; i<length; i++) {
		    Main.hashArray.push(data.substring(i*11, i*11+11));
		}
		Main.hashString = data;
		var newsource = "https://vine.co/v/"+Main.hashArray[Main.currHashValue]+"/embed/simple?audio=1";
		console.log(newsource);
		$('.vine-embed').attr('src', newsource);
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
	var newsource = "https://vine.co/v/"+Main.hashArray[Main.currHashValue]+"/embed/simple?audio=1";
	console.log(newsource);
	$('.vine-embed').attr('src', newsource);
    }

    this.previousVideo = function() {
	Main.currHashValue = Main.currHashValue - 1;  
	if (Main.currHashValue < 0) { 
	    Main.currHashValue = Main.hashArray.length-1;
	}
	console.log("prev");
	var newsource = "https://vine.co/v/"+Main.hashArray[Main.currHashValue]+"/embed/simple?audio=1";
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

    function writeName(name) {
	$('#display-playlist-name').html(name);	
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

	
	var tempURLArray = (window.location.pathname).split("/");
	console.log(tempURLArray[tempURLArray.length-1]);
	var uid = tempURLArray[tempURLArray.length-1];
	var name = "compilation.mp4";
	$.ajax ({
	    type:"GET",
	    url: "http://vinelist.co/p/"+uid+"/name",
	    success: function(data) {
		console.log("this is the name = " + data);
		name = data;
		writeName(data);

	    },
	    error: function(data) {
		console.log("error: " + data);
	    }
	});
	
	
	Main.populateHashArray(window.location.pathname);

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

	$('#compilation').click(function() {

		var temparr= (window.location.pathname).split("/");
		console.log("temparr =  " + temparr);
		var uid = temparr[2];
		console.log("UID = " + uid);
		window.open("http://vinelist.co/compile/"+uid+"/"+name+".mp4");
	/*	$.ajax({
			type:"GET",
			data:{"hash":uid},
			url:"http://fidler.io/compile",
			success:function(data) {
				console.log(data);
			},
			error: function(data){
				console.log("error = " + data);
			}
			
		});	*/
	});

    });
}
