document.getElementById("timeForm").addEventListener("submit", function(event) {
	event.preventDefault(); // Prevent form submission

	// Retrieve the current URL
	chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
		let url = tabs[0].url;
		console.log("URL: " + url);
		
		if(!url.startsWith("https://www.youtube.com")) {
			alert("You need to be on a YouTube video page");
			return;
		}
	});
		
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
		alert("End time should be after start time.");
		return;
	}
	
	//// TODO: Check that the time is legitimate regarding the video times
	
	
	

	// Display the entered times in the console
	console.log("Start Time: " + startTime);
	console.log("End Time: " + endTime);

	// Perform further actions with the entered time
	
	//// TODO: Loop the YouTube video
		
});

function isValidTime(time) {
  // Regular expression pattern for the format mm:ss
  var pattern = /^[0-5][0-9]:[0-5][0-9]$/;
  return pattern.test(time);
}

function convertTimeToSeconds(time) {
  var parts = time.split(":");
  var minutes = parseInt(parts[0]);
  var seconds = parseInt(parts[1]);
  return minutes * 60 + seconds;
}
