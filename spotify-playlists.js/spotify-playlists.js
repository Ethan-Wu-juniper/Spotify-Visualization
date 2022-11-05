var request = require("request");
var user_id = "TODO";
var token = "Bearer TODO"
var playlists_url="https://api.spotify.com/v1/users/"+user_id+"/playlists";

request({url:playlists_url, headers:{"Authorization":token}}, function(err, res){
	if (res){
		var playlists=JSON.parse(res.body);	
		var playlist_url = playlists.items[0].href;
		request({url:playlist_url, headers:{"Authorization":token}}, function(err, res){
			if (res){
				var playlist = JSON.parse(res.body);
				console.log("playlist: " + playlist.name);
				playlist.tracks.items.forEach(function(track){
					console.log(track.track.name);
				});
			}
		})		
	}
})
