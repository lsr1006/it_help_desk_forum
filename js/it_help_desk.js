// IT Help Desk Forum - it_help_desk.js (UPDATED 4/12/2021)

/* ================================
 *			GLOBAL VARS
 * ================================ */
 
// thread page
var replyCount = 0;		// number of replies on a thread
var bestAnswerId = 0;	// reply number of the best answer

// profile page
var thename;			// saves pervious name
var thesumary;			// saves pervious summary

// thread list page
var reload;				// hold current topics
var xmlData;



/* ================================
 *			WINDOW.ONLOAD
 * ================================ */
 
window.onload = function() {
	
	
	// site navidation header (all pages)
	$("nav-home").onclick = function() { location.href = "site_home.html"; };
	$("nav-index").onclick = function() { location.href = "forum_main.html"; };
	$("nav-account").onclick = function() { location.href = "account.html"; };
	$("nav-login").onclick = function() { location.href = "login.html"; };
	$("nav-register").onclick = function() { location.href = "registration.html"; };
	//$("nav-logout").onclick = function() { location.href = ""; };
	
	// gets the name of the current html file open in the window
	var currentPage = window.location.href.substring(window.location.href.lastIndexOf('/')+1);
	
	// thread page
	if(currentPage == "thread.html") {
		loadDoc();
		$("reply-button").onclick = createNewReply;
	}
	
	// forum main page (index)
	if(currentPage == "forum_main.html") {
		var boards = $$("div.sub-topic");
		for (var i = 0; i < boards.length; i++) {	// links all board topics to the thread_list.html page
			boards[i].onclick = function() { location.href = "thread_list.html"; };
		}
	}
	
	// thread list page
	if(currentPage == "thread_list.html") {
		$("btn-search").onclick = threadSearch;
		$("btn-new-thread").onclick = addThread;
		reload = $$('div.sub-topic'); //save current topics
		refreshThreadLinks();
	}
};


/* ================================
 *		LOAD FILE
 * ================================ */

function loadDoc() {
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
			loadReplies(this);
		}
	};
	
	xhttp.open("GET", "Catalog.xml", true);
	xhttp.send();
}

/* ================================
 *		THREAD PAGE FUNCTIONS
 * ================================ */
function loadReplies(xml) {
	var i;
	var xmlDoc = xml.responseXML;
	xmlData = xmlDoc.getElementsByTagName("REPLY");
	
	//get div where reply will be posted
	var postArea = $("posts");
	
	for (var j = 0; j < xmlData.length; j++) {
		// increment numbers for the reply count
		replyCount++;
		
		// create new div id's for reply div, content div, post text, post timestamp, and best answer div so they are unique
		var replyIdStr = "reply" + replyCount;
		var contentIdStr = "content" + replyCount;
		var textIdStr = "text" + replyCount;
		var timestampIdStr = "timestamp" + replyCount;
		var bestAnsIdStr = "best-ans" + replyCount;
		
		var userIdStr = "user" + replyCount;
		var rankIdStr = "rank" + replyCount;
		var karmaIdStr = "karma" + replyCount;
		var countIdStr = "count" + replyCount;
		
		// ============ Create and Format new div for editing the reply ===============
		var newReply = document.createElement("div");
		newReply.className = "reply";
		newReply.id = "temp-reply";
		
		// vars for post profile information
		var newProfile = document.createElement("div");
		newProfile.className = "profile";
		
		var newProfileImg = document.createElement("img");
		newProfileImg.className = "profile-picture";
		newProfileImg.src = "images/blank_user.png";
		
		// vars for post profile text
		var textUsername = document.createElement("h5");
		textUsername.appendChild(document.createTextNode(xmlData[j].getElementsByTagName("NAME")[0].childNodes[0].nodeValue));
		
		var textRank = document.createElement("h5");
		textRank.appendChild(document.createTextNode("Rank: " + xmlData[j].getElementsByTagName("RANK")[0].childNodes[0].nodeValue));
		
		var textKarma = document.createElement("h5");
		textKarma.appendChild(document.createTextNode("Karma Points: " + xmlData[j].getElementsByTagName("KARMA")[0].childNodes[0].nodeValue));
		
		var textCount = document.createElement("h5");
		textCount.appendChild(document.createTextNode("Post Count:" + xmlData[j].getElementsByTagName("POSTCOUNT")[0].childNodes[0].nodeValue));
		
		// vars for post content area
		var newPostContent = document.createElement("div");
		newPostContent.className = "post-content";
		newPostContent.id = "temp-post-content";
		
		// add post text, timestamp, and best answer button
		var postParagraph = document.createElement("p");
		postParagraph.appendChild(document.createTextNode(xmlData[j].getElementsByTagName("TEXT")[0].childNodes[0].nodeValue));
		newPostContent.appendChild(postParagraph);
		
		var postTimeStamp = document.createElement("span");
		postTimeStamp.className = "post-timestamp";
		
		
		var btnBestAnswer = document.createElement("button");
		btnBestAnswer.appendChild(document.createTextNode("Mark as Best Answer"));
		btnBestAnswer.className = "btn-best-answer";
		btnBestAnswer.onclick = updateBestAnswer;
		
		var timeStr = "Reply posted on " + xmlData[j].getElementsByTagName("DATE")[0].childNodes[0].nodeValue;
		postTimeStamp.appendChild(btnBestAnswer);
		postTimeStamp.appendChild(document.createTextNode(timeStr));
		newPostContent.appendChild(postTimeStamp);
		
		// Assigning the generated unique id's to the elements
		postParagraph.id = textIdStr;
		postTimeStamp.id = timestampIdStr;
		btnBestAnswer.id = bestAnsIdStr;
		newPostContent.id = contentIdStr;
		newReply.id = replyIdStr;
		
		textUsername.id = userIdStr;
		textRank.id = rankIdStr;
		textKarma.id = karmaIdStr;
		textCount.id = countIdStr;
		
		// ====================== assembling the div ======================
		newReply.appendChild(newProfile);
		
		newProfile.appendChild(newProfileImg);
		newProfile.appendChild(textUsername);
		newProfile.appendChild(textRank);
		newProfile.appendChild(textKarma);
		newProfile.appendChild(textCount);
		
		newReply.appendChild(newPostContent);
	
		// create a "All Replies:" header upon the creation of the first reply
		if(replyCount == 1) {	
			//alert("first reply");
			var repliesHeader = document.createElement("div");
			repliesHeader.className = "reply-header";
			repliesHeader.id = "reply-header";
			
			var repliesHeadText = document.createElement("span");
			repliesHeadText.appendChild(document.createTextNode("All Replies:"));
			repliesHeadText.className = "topic-name";
			repliesHeader.appendChild(repliesHeadText);
			$("posts").insertBefore(repliesHeader, $("reply1"));
		}
		
		//============== Adding edit reply div to page ====================
		postArea.appendChild(newReply);
		
	}
	
}

// called by the "Reply to Thread" button. Creates a new reply div where the contents of the reply can be typed
function createNewReply() {
	
	//hide reply button at top of thread
	$("reply-button").style.visibility = "hidden";
	
	//get div where reply will be posted
	var postArea = $("posts");
	
	// ============ Create and Format new div for editing the reply ===============
	var newReply = document.createElement("div");
	newReply.className = "reply";
	newReply.id = "temp-reply";
	
	// vars for post profile information
	var newProfile = document.createElement("div");
	newProfile.className = "profile";
	
	var newProfileImg = document.createElement("img");
	newProfileImg.className = "profile-picture";
	newProfileImg.src = "images/blank_user.png";
	
	// vars for post profile text
	
	var userIdStr = "user" + (replyCount + 1);
	var rankIdStr = "rank" + (replyCount + 1);
	var karmaIdStr = "karma" + (replyCount + 1);
	var countIdStr = "count" + (replyCount + 1);
		
	var textUsername = document.createElement("h5");
	textUsername.id = userIdStr;
	textUsername.appendChild(document.createTextNode("Username"));
	
	var textRank = document.createElement("h5");
	textRank.id = rankIdStr;
	textRank.appendChild(document.createTextNode("forum rank"));
	
	var textKarma = document.createElement("h5");
	textKarma.id = karmaIdStr;
	textKarma.appendChild(document.createTextNode("karma points"));
	
	var textCount = document.createElement("h5");
	textCount.id = countIdStr;
	textCount.appendChild(document.createTextNode("post count"));
	
	// vars for post content area
	var newPostContent = document.createElement("div");
	newPostContent.className = "post-content";
	newPostContent.id = "temp-post-content";
	
	var newForm = document.createElement("form");
	var newTextArea = document.createElement("textarea");
	newTextArea.id = "new-thread-body";
	newTextArea.rows = "20";
	newTextArea.cols = "96";
	newForm.appendChild(newTextArea);
	
	//vars for post buttons
	var BtnSave = document.createElement("button");
	BtnSave.className = "btn-new-post";
	BtnSave.appendChild(document.createTextNode("Save & Post Reply"));
	BtnSave.onclick = postReply;
	
	var BtnCancel = document.createElement("button");
	BtnCancel.className = "btn-new-post";
	BtnCancel.appendChild(document.createTextNode("Cancel"));
	BtnCancel.onclick = cancelReply;
	
	// ====================== assembling the div ======================
	newReply.appendChild(newProfile);
	
	newProfile.appendChild(newProfileImg);
	newProfile.appendChild(textUsername);
	newProfile.appendChild(textRank);
	newProfile.appendChild(textKarma);
	newProfile.appendChild(textCount);
	
	newReply.appendChild(newPostContent);
	
	newPostContent.appendChild(newForm);
	newPostContent.appendChild(BtnSave);
	newPostContent.appendChild(BtnCancel);
	
	//============== Adding edit reply div to page ====================
	postArea.appendChild(newReply);
	newReply.scrollIntoView();
}

// called by the save button when editing a reply
function postReply() {
	
	if ($("new-thread-body").value == "")		// if the textbox is empty do not allow the user to post the reply
	{
		alert("You cannot post an empty reply");
		
	} else {
		
		// increment numbers for the reply count
		replyCount++;
		
		// create new div id's for reply div, content div, post text, post timestamp, and best answer div so they are unique
		var replyIdStr = "reply" + replyCount;
		var contentIdStr = "content" + replyCount;
		var textIdStr = "text" + replyCount;
		var timestampIdStr = "timestamp" + replyCount;
		var bestAnsIdStr = "best-ans" + replyCount;
		
		// Store typed reply in a var
		var postText = $("new-thread-body").value;
		
		// remove editing textbox and buttons
		var newPostContent = $("temp-post-content");
		newPostContent.innerHTML = '';
		
		// get timestamp variables
		var date = new Date().toLocaleString();
		
		// add post text, timestamp, and best answer button
		var postParagraph = document.createElement("p");
		postParagraph.appendChild(document.createTextNode(postText));
		newPostContent.appendChild(postParagraph);
		
		var postTimeStamp = document.createElement("span");
		postTimeStamp.className = "post-timestamp";
		
		
		var btnBestAnswer = document.createElement("button");
		btnBestAnswer.appendChild(document.createTextNode("Mark as Best Answer"));
		btnBestAnswer.className = "btn-best-answer";
		btnBestAnswer.onclick = updateBestAnswer;
		
		var timeStr = "Reply posted on " + date;
		postTimeStamp.appendChild(btnBestAnswer);
		postTimeStamp.appendChild(document.createTextNode(timeStr));
		newPostContent.appendChild(postTimeStamp);
		
		// Assigning the generated unique id's to the elements
		postParagraph.id = textIdStr;
		postTimeStamp.id = timestampIdStr;
		btnBestAnswer.id = bestAnsIdStr;
		newPostContent.id = contentIdStr;
		$("temp-reply").id = replyIdStr;
		
		// un-hide the thread reply button
		$("reply-button").style.visibility = "";
		
		// create a "All Replies:" header upon the creation of the first reply
		if(replyCount == 1) {	
			var repliesHeader = document.createElement("div");
			repliesHeader.className = "reply-header";
			repliesHeader.id = "reply-header";
			
			var repliesHeadText = document.createElement("span");
			repliesHeadText.appendChild(document.createTextNode("All Replies:"));
			repliesHeadText.className = "topic-name";
			repliesHeader.appendChild(repliesHeadText);
			$("posts").insertBefore(repliesHeader, $("reply1"));
		}
	}
}


// called by the cancel button while editing a new reply
function cancelReply() {
	// un-hide the thread reply button
	$("reply-button").style.visibility = "";
	
	// remove the edit reply div
	$("temp-reply").remove();
}


// called when the "Mark as Best Answer" button is clicked
// this.id is passed to markBestAnswer() as it contains a unique identifier for the post
function updateBestAnswer() {
	
	// if there is currently no best answer marked
	if(bestAnswerId == 0) {			
		markBestAnswer(this.id);
		
	} else {	// if there is already a best answer

		removeBestAnswer();
		markBestAnswer(this.id);
	} 
}


// Adds the best answer styling to a reply on the page. Pins the reply at the top directly under the original post
function markBestAnswer(selectedBtnId) {
	
	$(selectedBtnId).style.visibility = "hidden";			// hides the "Mark as Best Answer" button after clicked
	
	selectedBtnId = selectedBtnId.replace(/[^0-9]/g,'');	// cuts off everything but the number from the button id to get the post number
	var selectedReply = $("reply" + selectedBtnId);			// id of the div containing best answer reply

	// modify appearance of the reply to have the best answer styling
	var bestAnswerDiv = document.createElement("div");
	bestAnswerDiv.className = "best-answer-text";
	bestAnswerDiv.appendChild(document.createTextNode("Marked as Best Answer"));
	
	var bestAnswerRemoveBtn = document.createElement("button");
	bestAnswerRemoveBtn.className = "btn-remove-best-ans";
	bestAnswerRemoveBtn.appendChild(document.createTextNode("Un-mark"));
	bestAnswerRemoveBtn.onclick = removeBestAnswer;
	bestAnswerDiv.appendChild(bestAnswerRemoveBtn);
	
	selectedReply.className = "best-answer";
	selectedReply.prepend(bestAnswerDiv);
	
	bestAnswerId = selectedBtnId;		//updates global var for the best answer id
	
	// creates pinned best answer div to be added under the original post
	
	var pinnedReply = document.createElement("div");
	pinnedReply.className = "best-answer";
	pinnedReply.id = "pinned-reply";
	
	// vars for post profile information
	var pinnedProfile = document.createElement("div");
	pinnedProfile.className = "profile";
	
	var pinnedProfileImg = document.createElement("img");
	pinnedProfileImg.className = "profile-picture";
	pinnedProfileImg.src = "images/blank_user.png";
	
	// vars for post profile text information
	var textUsername = document.createElement("h5");
	var textUserValue = $("user" + bestAnswerId).textContent;
	textUsername.appendChild(document.createTextNode(textUserValue));
	
	var textRank = document.createElement("h5");
	var textRankValue = $("rank" + bestAnswerId).textContent;
	textRank.appendChild(document.createTextNode(textRankValue));
	
	var textKarma = document.createElement("h5");
	var textKarmaValue = $("karma" + bestAnswerId).textContent;
	textKarma.appendChild(document.createTextNode(textKarmaValue));
	
	var textCount = document.createElement("h5");
	var textCountValue = $("count" + bestAnswerId).textContent;
	textCount.appendChild(document.createTextNode(textCountValue));
	
	
	// vars for post content area
	var pinnedPostContent = document.createElement("div");
	pinnedPostContent.className = "post-content";
	pinnedPostContent.id = "pinned-post-content";
	
	var pinnedPostText = document.createElement("p");
	var pinnedTextStr = $("text" + selectedBtnId).innerHTML;
	pinnedPostText.appendChild(document.createTextNode(pinnedTextStr));
	
	// vars for pinned reply best answer header
	var pinnedBestAnsHeader = bestAnswerDiv.cloneNode(false);
	pinnedBestAnsHeader.appendChild(document.createTextNode("Marked as Best Answer"));
	
	// vars for pinned best answer jump-to button
	var pinnedJumpBtn = document.createElement("button");
	pinnedJumpBtn.className = "btn-remove-best-ans";
	pinnedJumpBtn.appendChild(document.createTextNode("Jump to reply"));
	pinnedJumpBtn.onclick = function() { $("reply" + bestAnswerId).scrollIntoView(); }
	pinnedBestAnsHeader.appendChild(pinnedJumpBtn);
	
	// assembling the div
	pinnedReply.appendChild(pinnedProfile);
	
	pinnedProfile.appendChild(pinnedProfileImg);
	pinnedProfile.appendChild(textUsername);
	pinnedProfile.appendChild(textRank);
	pinnedProfile.appendChild(textKarma);
	pinnedProfile.appendChild(textCount);
	
	pinnedReply.appendChild(pinnedPostContent);
	
	pinnedPostContent.appendChild(pinnedPostText);
	
	pinnedReply.prepend(pinnedBestAnsHeader);
	
	// adding div below original post
	$("posts").insertBefore(pinnedReply, $("reply-header"));

}


// called to remove the currently marked best answer
function removeBestAnswer() {
	
	var reply = $("reply" + bestAnswerId);
	reply.className = "reply";										// removes best answer styling and reverts it to normal reply
	reply.getElementsByClassName("best-answer-text")[0].remove();	// removes best answer header div
	$("best-ans" + bestAnswerId).style.visibility = "";				// un-hides the "Mark as Best Answer" button
	$("pinned-reply").remove();										// removes the pinned best answer post
	bestAnswerId = 0;												// resets global var for the best answer id to 0
	
}


/* ================================
 *		PROFILE PAGE FUNCTIONS
 * ================================ */

// edits proflife 
function edit(){
	
	var thename = $('nick').innerHTML;
	var thesumary=$('summary').innerHTML;
	note();

	var toolbar = $("tool_bar");// cahnges the tool bar to add  cancel save and upload button 
	var profile=$("nick");
	var name = profile.innerHTML;
	summary = $("summary").innerHTML;
	info=$("summary");
	var buttonS = document.createElement('button');// creating save button
	buttonS.appendChild(document.createTextNode("Save"));
	buttonS.onclick=save;
	buttonS.addClassName('btn-new-post');

	var buttonC = document.createElement('button');//crating cancel button 
	buttonC.appendChild(document.createTextNode("Cancel"));
	buttonC.onclick=cancel;
	buttonC.addClassName('btn-new-post');

	var buttonU = document.createElement('button');// creating upload button 
	buttonU.appendChild(document.createTextNode("Upload"));
	buttonU.addClassName('btn-new-post');
	toolbar.innerHTML="";
	toolbar.appendChild(buttonS);
	toolbar.appendChild(buttonC);
	toolbar.appendChild(buttonU);

	var nickname = document.createElement('input');// add text box for name 
	nickname.type ='text';
	nickname.id='input1';
	nickname.size='5';
	nickname.value = name;
	profile.innerHTML="";
	profile.appendChild(nickname);
	
	var textbox = document.createElement('textarea');// add text area for the summary 
	textbox.id='sumary';
	textbox.rows='25';
	textbox.cols='75';
	textbox.value=summary;
	info.innerHTML="";
	info.appendChild(textbox);
}

function cancel(){// load up old infomation
	var profile = $('nick');

	var name =  thename;

	var summary = thesumary;
	var toolbar = $("tool_bar");
	var info=$('summary');

	var buttonEx = document.createElement('button');
	buttonEx.appendChild(document.createTextNode("Edit"));
	buttonEx.onclick=edit;
	buttonEx.addClassName('btn-new-post');
	toolbar.innerHTML="";
	toolbar.appendChild(buttonEx);
	
	profile.innerHTML = "";
	profile.appendChild(document.createTextNode(name));
	info.innerHTML = "";
	info.appendChild(document.createTextNode(summary));
}


function  save(){// save new infomation
	var profile = $('nick')
	var name =  $('input1').value;
	var summary = $('sumary').value;
	var toolbar = $("tool_bar");
	var info=$('summary');

	var buttonEx = document.createElement('button');// cahnge tool bar back to only having edit 
	buttonEx.appendChild(document.createTextNode("Edit"));
	buttonEx.onclick=edit;
	buttonEx.addClassName('btn-new-post');
	toolbar.innerHTML="";
	toolbar.appendChild(buttonEx);

	profile.innerHTML = "";
	profile.appendChild(document.createTextNode(name)); // takes input for name and set it to the profile 
	info.innerHTML = "";
	info.appendChild(document.createTextNode(summary)); // take input for summary and sets it to the profile 
}


function note(){// save old infomation 
	
	thename = $('nick').innerHTML;
	thesumary=$("summary").innerHTML;
}


/* ================================
 *	THREAD LIST PAGE FUNCTIONS
 * ================================ */
 
// sets onclick for all threads in thread list to thread.html
function refreshThreadLinks() {
	var threads = $$("div.sub-topic");
	for (var i = 0; i < threads.length; i++) {
		threads[i].onclick = function() { location.href = "thread.html"; };
	}
}

function addThread() {// creat a new  subtopic 
	var toolbar = $$("div.topic");// tool bar hold buttons 

	var oldthread = $$("div.sub-topic");// hold the old threads
	var contanor =$$("div.topic-container");//where all the topics go
	
	// create save and cancel  button for the tool bar 
	var buttonS = document.createElement('button');
	buttonS.appendChild(document.createTextNode("Save"));
	buttonS.onclick=saveThread;
	buttonS.addClassName('btn-new-post');

	var buttonC = document.createElement('button');
	buttonC.appendChild(document.createTextNode("Cancel"));
	buttonC.onclick=cancelThread;
	buttonC.addClassName('btn-new-post');

	var boardName = document.createElement('span');
	boardName.className = "topic-name";
	boardName.appendChild(document.createTextNode("CATEGORY_NAME"));

	toolbar[0].innerHTML="";
	toolbar[0].appendChild(boardName);
	toolbar[0].appendChild(buttonS);
	toolbar[0].appendChild(buttonC);

	// creats a nex input text bar for the subject and text box for the question and information 
	var newPostContent = document.createElement("div");
	newPostContent.className = "new-thread";
	var subinput=document.createElement("input");
	subinput.type="text";
	subinput.id="new-thread-subject";
	var label1=document.createElement("label");
	label1.htmlFor="for";
	label1.appendChild(document.createTextNode("Subject:"));
	
	var labelbody=document.createElement("labal");
	labelbody.htmlFor = "new-thread-body";
	labelbody.appendChild(document.createTextNode("Body:"));
	
	var newForm = document.createElement("form");
	newForm.appendChild(label1);
	newForm.appendChild(subinput);
	newForm.appendChild(document.createElement("br"));
	newForm.appendChild(labelbody);
	newForm.appendChild(document.createElement("br"));
	var newTextArea = document.createElement("textarea");
	newTextArea.id = "new-thread-body" ;
	newTextArea.rows = "25";
	newTextArea.cols = "100";
	newForm.appendChild(newTextArea);
	newPostContent.appendChild(newForm);
	contanor[1].appendChild(newPostContent);
	reload = $$('div.sub-topic');// svae new sub topics 
	
	// hides search bar and button while creating a new thread
	$("btn-search").style.visibility = "hidden";
	$("search").style.visibility = "hidden";
}


function  saveThread(){ // creates new subic with the infomation in the text bar and text box 
	
	var toolbar = $$("div.topic");
	var buttonE = document.createElement('button'); 
	var subject = $("new-thread-subject").value;
	var body = $("new-thread-body").value;
	var thread =document.createElement("div");
	
	if(subject == "") { // if the subject line is empty it will alert the user 
		alert("You cannot create a thread without a subject title.");
	} else if(body == "") { // if the body textbox is empty it will alert the user 
		alert("You cannot create a thread with no body content.");
	} else {	
		buttonE.appendChild(document.createTextNode("Create New Thread"));
		buttonE.onclick=addThread;
		buttonE.addClassName('btn-new-post');
		
		var boardName = document.createElement('span');
		boardName.className = "topic-name";
		boardName.appendChild(document.createTextNode("CATEGORY_NAME"));
	
		toolbar[0].innerHTML="";
		toolbar[0].appendChild(boardName);
		toolbar[0].appendChild(buttonE);

		thread.addClassName('sub-topic');
		//thread.onclick= (location.href='thread.html');
		var par =document.createElement("p");
		var spanname = document.createElement("span");
		spanname.addClassName('name');
		spanname.appendChild(document.createTextNode(subject));
		var span = document.createElement("span");
		span.addClassName('sub-topic-summary');
		span.style.whiteSpace = "pre";
		span.appendChild(document.createTextNode("Created By: THREAD_OWNER \t Date Posted: DATE \t Replies: 0 \t Solved? Y/N"));
		par.appendChild(spanname);
		par.appendChild(span);
		thread.appendChild(par);

		var textarea =$$('div.new-thread');
		textarea[0].remove();

		var contanor =$$("div.topic-container");
		contanor[1].appendChild(thread);
		$("btn-search").style.visibility = "";
		$("search").style.visibility = "";
		reload = $$('div.sub-topic');// svae new sub topics 
		refreshThreadLinks();
	}
}

// revert the page back to its previous state, cancel editing the new post
function cancelThread() { 
	var toolbar = $$("div.topic");
	var buttonE = document.createElement('button');
	buttonE.appendChild(document.createTextNode("Create New Thread"));
	buttonE.onclick=addThread;
	buttonE.addClassName('btn-new-post');
	
	var boardName = document.createElement('span');
	boardName.className = "topic-name";
	boardName.appendChild(document.createTextNode("CATEGORY_NAME"));
	
	toolbar[0].innerHTML="";
	toolbar[0].appendChild(boardName);
	toolbar[0].appendChild(buttonE);
	textarea = $$('div.new-thread');

	textarea[0].remove();
	$("btn-search").style.visibility = "";
	$("search").style.visibility = "";
}

// search the thread list based off whats in the search bar and names in the the span tags
function threadSearch() { 
	
	var input =$('search').value;
	//alert(input);

	var contanor =$$("div.topic-container");
	var subtopic = $$('div.sub-topic');

	var name = $$('span.name');
	//alert(name[0].innerHTML != input);
	//contanor[1].remove();
	
	if(input == ""){ // if its epmpty it reverts it back to it pervious state 
		contanor[1].innerHTML ="";
		for (var i =0; i< reload.length; i++){
			contanor[1].appendChild(reload[i]);
		}
	} else { // else it will delete the sub ttopic that dont match the on you are searhing 
		contanor[1].innerHTML ="";
		for (var i =0; i< reload.length; i++){
			contanor[1].appendChild(reload[i]);
		}
		
		for (var i =0; i< subtopic.length; i++) {
			
			if (name[i].innerHTML != input) {
				subtopic[i].remove();
			}
		}
	}
}