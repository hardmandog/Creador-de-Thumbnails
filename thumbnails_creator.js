function capturar(){
    var canvas = document.getElementById('canvas');
    var video = document.getElementById('video');
    canvas.width=600
    canvas.height=300
    canvas.getContext('2d').drawImage(video, 0, 0, 600, 300);

}

function modificar(url){
  
  document.getElementById("video").src = url;

}  

function Play(){
	var canvas = document.getElementById('canvas');
	var ctx = canvas.getContext("2d");
	var img = new Image();
	img.src = "play.png";
	
	

	ctx.drawImage(img,
			canvas.width / 2 - img.width / 2  ,
            canvas.height / 2 - img.height / 2);



}