var waypoints = $('#patrick').waypoint({
  handler: function(direction) {
    console.log("gif loading");
    $("#patrick > img.gif").attr('src', 'img/patrick-the-teacher.gif');
    this.destroy();
  },
  offset: 200
});

var waypoints = $('#melanie').waypoint({
  handler: function(direction) {
    console.log("gif loading");
    $("#melanie > img.gif").attr('src', 'img/melanie-the-mother.gif');
    this.destroy();
  },
  offset: 200
});

var waypoints = $('#carlos').waypoint({
  handler: function(direction) {
    console.log("gif loading");
    $("#carlos > img.gif").attr('src', 'img/carlos-the-artist.gif');
    this.destroy();
  },
  offset: 200
});


var waypoints = $('#jody').waypoint({
  handler: function(direction) {
    console.log("gif loading");
    $("#jody > img.gif").attr('src', 'img/jody-the-transplant.gif');
    this.destroy();
  },
  offset: 200
});

