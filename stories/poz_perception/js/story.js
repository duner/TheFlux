$(document).ready(function(){

	$('.word-prev').on('click', function(){
    $(this).parent().prev('.definition').toggle(this);
	});
	
	$('.word-next').on('click', function(){
    $(this).parent().next('.definition').toggle(this);
	});

//http://stackoverflow.com/questions/28374713/how-can-i-disable-jquery-toggle-effect-when-the-screen-size-changes

	// THESE ARE BUTTON-SPECIFIC FUNCTIONS TO MAKE THE NARRATIVES APPEAR
	
	$( "#johnR-btn" ).click(function() {
		hideStories();
	  $( "#johnR" ).fadeIn( "slow", function() {
	  	console.log("This is John's story.");
	  });
	});

	$( "#eddieG-btn" ).click(function() {
		hideStories();
	  $( "#eddieG" ).fadeIn( "slow", function() {
	  	console.log("This is Eddie's story.");
	  });
	});

	$( "#damonJ-btn" ).click(function() {
		hideStories();
	  $( "#damonJ" ).fadeIn( "slow", function() {
	  	console.log("This is Damon's story.");
	  });
	});

	$( "#jimP-btn" ).click(function() {
		hideStories();
	  $( "#jimP" ).fadeIn( "slow", function() {
	  	console.log("This is Jim's story.");
	  });
	});

	$( "#hadeisS-btn" ).click(function() {
		hideStories();
	  $( "#hadeisS" ).fadeIn( "slow", function() {
	  	console.log("This is Hadeis' story.");
	  });
	});

	$( "#philC-btn" ).click(function() {
		hideStories();
	  $( "#philC" ).fadeIn( "slow", function() {
	  	console.log("This is Phil's story.");
	  });
	});

	// THIS IS TO MAKE THE BLANK SPACE DISAPPER
	// NOT SURE WHAT THIS IS FOR - ZACH
	$( ".storyBTN" ).click(function() {
	  $( "#blankSpace" ).hide( "fast", function() {
	    console.log("Blank space hidden.");
	  });
	});

	// THIS IS TO MAKE THE OTHER STORIES DISAPPEAR
	var the_stories = ["#johnR", "#eddieG","#damonJ","#jimP","#hadeisS","#philC"];
	
	
	function hideStories() {
		for (i = 0; i < the_stories.length; i++) { 
			$(the_stories[i]).fadeOut("fast");
		}
	}

});
