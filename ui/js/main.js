var Main = Main || new function() {
    
    this.hashes = "";
    this.hashArray = ["bgep05eMY3l", "hhrWdw3FJx3"];
    this.currHashValue = 0;


    this.nextVideo = function() {
	console.log("next");
	var newembed = "<iframe class='vine-embed' src='https://vine.co/v/"+Main.hashArray[Main.currHashValue]+"/embed/simple' width='320' height='320' frameborder='0'></iframe><script async src='http://platform.vine.co/static/scripts/embed.js' charset='utf-8'></script>";
	console.log(newembed);
	$('.vine-embed').html(newembed);
    }

    this.previousVideo = function() {
		
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
