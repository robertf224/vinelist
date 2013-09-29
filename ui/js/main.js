var Main = Main || new function() {
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

    });
}
