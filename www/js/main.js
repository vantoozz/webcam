var onFailSoHard = function(e) {
	console.log('Reeeejected!', e);
};

var webcamvideo = document.getElementById('webcamvideo');

if(navigator.getUserMedia){
	console.log(webcamvideo);
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