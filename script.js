const apiKey = window.apiKey;
console.log(apiKey);
var myTimeout;

document.getElementById("timeForm").addEventListener("submit", function(event) {
	event.preventDefault(); // Prevent form submission
	if(myTimeout)
		clearTimeout(myTimeout);
	
	var url;
	// Retrieve the current URL and videoID
	chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
		// Retrieve input values
		var startTimeInput = document.getElementById("startTime");
		var startTime = startTimeInput.value;
		
		var endTimeInput = document.getElementById("endTime");
		var endTime = endTimeInput.value;
		
		if (!isValidTime(startTime) || !isValidTime(endTime)) {
			alert("Invalid time format. Please use the format mm:ss.");
			return;
		}
		
		if(convertTimeToSeconds(startTime) > convertTimeToSeconds(endTime)) {
			alert("End time must be after start time.");
			return;
		}	

		// Display the entered times in the console
		console.log("Start Time: " + startTime);
		console.log("End Time: " + endTime);

		url = tabs[0].url;
		console.log("URL: " + url);
		
		if(!url.startsWith("https://www.youtube.com/watch")) {
			alert("You need to be on a YouTube video page.");
			return;
		}
		
		var videoID = getVideoIdFromURL(url);
		if(!videoID) {
			alert("FATAL ERROR! Exiting...");
			return;
		}
		console.log("Video ID: " + videoID);
		
		var api_request = 'https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&id=' + videoID + '&key=' + apiKey;
		console.log("API Request: " + api_request);
		
		var responded_data;
		fetch(api_request)
		  .then(function(response) {
			if (response.ok) {
			  return response.json();
			} else {
			  // Error handling
			  throw new Error('Request failed with status code ' + response.status);
			}
		  })
		  .then(function(data) {
			console.log(data);
			validateTimeInVideo(data, endTime);
			performLoop(url, startTime, endTime, tabs[0]);
		  })
		  .catch(function(error) {
			// Error handling
			console.error('Request failed: ', error);
		  });		
	});
});

function isValidTime(time) {
  // Regular expression pattern for the format mm:ss or m:ss
  var pattern = /^[0-5]?[0-9]:[0-5][0-9]$/;
  return pattern.test(time);
}

function convertTimeToSeconds(time) {
  var parts = time.split(":");
  var minutes = parseInt(parts[0]);
  var seconds = parseInt(parts[1]);
  return minutes * 60 + seconds;
}

function getVideoIdFromURL(url) {
	// Regular expression pattern for the format of a YouTube video ID 
	var videoIdRegex = /v=[^&#]+/;
	var exec = videoIdRegex.exec(String(url));
	var videoID = String(exec).replace("v=","");
	return videoID;
}

function validateTimeInVideo(data, endTime) {
	// Validate the user input regarding the current video played
	var duration = data["items"][0]["contentDetails"]["duration"];
	duration = duration.replace("PT","");
	var length;
	
	if(duration.indexOf("M") == -1) {
		var seconds = duration.replace("S","");
		seconds = parseInt(seconds);
		console.log("Video duration: " + seconds + " seconds");
		length = seconds;
	} 
	else {
		var parts = duration.split("M");
		var minutes = parts[0];
		var seconds = parts[1];
		seconds = seconds.replace("S","");
		
		minutes = parseInt(minutes);
		seconds = parseInt(seconds);
		
		console.log("Video duration: " + minutes + " minutes and " + seconds + " seconds");
		
		length = minutes*60 + seconds;
	}
	endTime = convertTimeToSeconds(endTime);
	
	if(length < endTime) {
		alert("End time must be before video's end time.");
		return;
	}
}

function performLoop(url, startTime, endTime, tab) {
	// Get the new timed URL and start looping
	var newLink = "https://www.youtube.com/watch?v=" + getVideoIdFromURL(url) + "&t=" + convertTimeToSeconds(startTime) + "s";
	console.log("Start link: " + newLink);
	var diff = convertTimeToSeconds(endTime)-convertTimeToSeconds(startTime);
	chrome.tabs.update(tab.id, {url: newLink});
	performLoopAgain(newLink, tab, diff);
}

function performLoopAux(newLink, tab, diff) {
	// Perform loop
	console.log("Done waiting");
	chrome.tabs.update(tab.id, {url: newLink});
	performLoopAgain(newLink, tab, diff);
}

function performLoopAgain(newLink, tab, diff) {
	// Set timeout
	console.log("Waiting for " + diff + " seconds (+ delay of 2 seconds)");
	delay = 1000*2;
	myTimeout = setTimeout(function() {
		performLoopAux(newLink, tab, diff);
	}, 1000 * diff + delay);
}

document.getElementById("timeForm").addEventListener("reset", function(event) {
	if(myTimeout)
		clearTimeout(myTimeout);
});