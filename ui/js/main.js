var Main = Main || new function() {
    function vinesToAdd(url) {
	var tempURL = url;
	var tempHTML = $('.vines-to-add').html();		
	console.log(tempHTML);		
	$('.vines-to-add').append(tempURL);		
    }


    //dom ready
    $(function() {
	$('#add-vine').click(function() {
	    vinesToAdd($('#create-playlist-link').val());   
	});
    });
}
