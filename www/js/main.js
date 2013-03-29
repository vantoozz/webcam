var onFailSoHard = function(e) {
	console.log('Reeeejected!', e);
};

var webcamvideo = document.getElementById('webcamvideo');

if(false && navigator.getUserMedia){
	navigator.getUserMedia({ video: true}, function(stream) {
		webcamvideo.src = window.URL.createObjectURL(stream);
		
		
		var idx = 0;
		var filters = ['grayscale', 'sepia', 'blur', 'brightness', 'contrast', ''];
		
		function changeFilter(e) {
		  var el = e.target;
		  el.className = '';
		  var effect = filters[idx++ % filters.length]; // loop through filters.
		  if (effect) {
		    el.classList.add(effect);
		  }
		}
		
		webcamvideo.addEventListener('click', changeFilter, false);
		
		
		
 	}, 
 	onFailSoHard);
}


$(function(){
	if (!('webkitSpeechRecognition' in window)) {
		$('#overlay').html('<h1>Ваш браузер не поддерживает распознование речи, используйте Google Chrome</h1>');
		return;
	}


	if(-1==window.location.hash.indexOf('#access_token=')){
		window.location='https://instagram.com/oauth/authorize/?client_id=5230ab9bd3464525b6658a950bafaf91&redirect_uri=http://webcam.dev.2nova.com/&response_type=token';
		return;	
	}

	var token=window.location.hash.replace('#access_token=', '');

	var recognizing = false;
	var words;

	var phrase=$('#phrase');
	var overlay=$('#overlay');

	var recognition = new webkitSpeechRecognition();
	recognition.continuous = true; //meaning that when the user stops talking, speech recognition will not end
	recognition.interimResults = true; // meaning that the only results returned by the recognizer are final and will not change
	//recognition.lang = 'en-US';
	
	recognition.onresult = function(event) {
		var w, str;
		var interim_transcript = '';
		words={};
		for (var i = event.resultIndex; i < event.results.length; ++i) {
			if (event.results[i].isFinal) {
				str=event.results[i][0].transcript.split(' ');
				str.reverse();
				for(w in str){
					if(''==str[w]){
						continue;
					}
					words[hex_md5(str[w])]=str[w];			
				}
				phrase.empty();
			}
			else{
				interim_transcript += event.results[i][0].transcript;		
			}
		}
		
		phrase.text(interim_transcript);
		
		draw_words();
		
	//	search_pics();
		
	}
	
	recognition.onstart = function() {
    	recognizing = true;
    	words={};
    	overlay.fadeOut();
  	}
	
	
	recognition.onend = function() {
    	recognizing = false;
    	overlay.fadeIn();
    }
	
	$('.start_recognizing').on('click', function(){
		if(recognizing){
			return;
		}
		recognition.start();	
	});
	
	
	pics={};
	
	var queries={};
	
	
	results=$('#results');
	
	
	draw_words = function(){
		for(var i in words){
			results.prepend('<div class="instagram_photo word_'+i+'"><p>'+words[i]+'</p></div>');
			get_picture(i);	
		}	
	}
	
	get_picture = function(i){
		if('undefined' == typeof(pics[i])){
			(function(n){
				if('undefined' != typeof(queries[n])){
					return;
				}
				queries[n]=1;
				$.ajax({
			        type: "GET",
			        dataType: "jsonp",
			        cache: false,
			        url: "https://api.instagram.com/v1/tags/"+words[n]+"/media/recent?access_token="+token+"&count=50",
			        success: function(response)  {
			            if('undefined' != typeof(response) && 'undefined' != typeof(response.meta) && 'undefined' != typeof(response.meta.code) && 200 == response.meta.code && 'undefined' != typeof(response.data)){
			            	var p=0, likes=0;
			            	for(var m in response.data){
			            		if('undefined' !=typeof(response.data[m]) && 'undefined' !=typeof(response.data[m].likes) && 'undefined' !=typeof(response.data[m].likes.count) && response.data[m].likes.count > likes){
			            			p=m;
			            		}	
			            	}
			            	
			            	if('undefined' !=typeof(response.data[p]) && 'undefined' !=typeof(response.data[p].images) && 'undefined' !=typeof(response.data[p].images.low_resolution) && 'undefined' == typeof(pics[n])){
			            		pics[n]=response.data[p].images.low_resolution.url;	
			            		update_pic(n, pics[n]);	
			            	}
			            }
			            delete queries[n];
			        }
			    });		
			}(i));
		}
		else{
			update_pic(i, pics[i]);	
		}	
	}
	
	update_pic = function(i, url){
		$('.word_'+i).css('background-image', 'url('+url+')');
	}
	

});

