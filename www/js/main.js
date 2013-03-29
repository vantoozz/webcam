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
		$('body').prepend('<h1>Ваш браузер не поддерживает распознование речи</h1>');
		return;
	}

	var recognizing = false;
	var words;

	var recognition = new webkitSpeechRecognition();
	recognition.continuous = true; //meaning that when the user stops talking, speech recognition will not end
	recognition.interimResults = true; // meaning that the only results returned by the recognizer are final and will not change
	recognition.lang = 'ru-RU';
	
	recognition.onresult = function(event) {
		var w, str;
		for (var i = event.resultIndex; i < event.results.length; ++i) {
			if (!event.results[i].isFinal) {
				str=event.results[i][0].transcript.split(' ');
				for(w in str){
					if(''==str[w]){
						continue;
					}
					words[hex_md5(str[w])]=str[w];			
				}
			}
		}
		
		search_pics();
		
	}
	
	recognition.onstart = function() {
    	recognizing = true;
    	words={};
    	$('.start_recognizing').attr('disabled', 'disabled');
  	}
	
	
	recognition.onend = function() {
    	recognizing = false;
    	$('.start_recognizing').removeAttr('disabled');
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
	
	search_pics = function(){
		for(var i in words){
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
				        url: "https://api.instagram.com/v1/tags/"+words[n]+"/media/recent?client_id=5230ab9bd3464525b6658a950bafaf91&count=1",
				        success: function(response)  {
				            if('undefined' != typeof(response) && 'undefined' != typeof(response.meta) && 200 == response.meta && 'undefined' != typeof(response.data) && 'undefined' !=typeof(response.data[0]) && 'undefined' !=typeof(response.data[0].images) && 'undefined' !=typeof(response.data[0].images.thumbnail)){
				            	if('undefined' == typeof(pics[n])){
				            		pics[n]=response.data[0].images.thumbnail.url;	
				            		results.prepend('<div class="instagram_photo"><img src="'+response.data[0].images.thumbnail.url+'" alt="'+words[n]+'" width="150" height="150"><p>'+words[n]+'</p></div>');	
				            	}
				            }
				            delete queries[n];
				        }
				    });		
				}(i));
			}
			else{
				results.prepend('<div class="instagram_photo"><img src="'+pics[i]+'" alt="'+words[i]+'" width="150" height="150"><p>'+words[i]+'</p></div>');
			}
		}
	}
	

});

