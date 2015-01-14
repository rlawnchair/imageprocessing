document.addEventListener("DOMContentLoaded", function(){
    var img = new Image();
    img.setAttribute("src", "img/redeye2.jpg");
    img.onload = function(){
        imgToCanvas(img);
    }
    
    var canvas = null, canvastmp = null;
    var gCtx = null, gCtx2 = null;
    var gActive = false;
    var gStartX = 0;
    var gStartY = 0;
    var gEndX = -1;
    var gEndY = -1;
    
    
    function imgToCanvas(myImg){
        canvas = document.getElementById("canvas");
        var w = myImg.naturalWidth;
        var h = myImg.naturalHeight;
        canvas.style.width = w+"px";
        canvas.style.height = h+"px";
        canvas.width = w;
        canvas.height = h;
        
        gCtx = canvas.getContext("2d");
        gCtx.clearRect(0, 0, w, h);
        gCtx.drawImage(myImg, 0, 0);

        var container = canvas.parentNode;
        canvastmp = document.createElement('canvas');
        canvastmp.id = "imageTemp";
        canvastmp.width  = w;
        canvastmp.height = h;
        container.appendChild(canvastmp);
        gCtx2 = canvastmp.getContext("2d");
        canvastmp.addEventListener("mousedown", onMouseDown, false);
    }
    
    function onMouseDown(aEvent)
    {
        
      if (gActive)
        return;
      gActive = true;

      gStartX = aEvent.clientX;
      gStartY = aEvent.clientY;
      var e = canvastmp;
      while (e)
      {
        gStartX -= e.offsetLeft;
        gStartY -= e.offsetTop;
        e = e.offsetParent;
      }

      canvastmp.addEventListener("mousemove", onMouseMove, false);
      canvastmp.addEventListener("mouseup", onMouseUp, false);
    }

    function onMouseUp(aEvent)
    {
      gActive = false;
      gCtx2.clearRect( 0, 0, canvastmp.width, canvastmp.height);
      canvastmp.removeEventListener("mousemove", onMouseMove, false);
      canvastmp.removeEventListener("mouseup", onMouseUp, false);

      // let's dance
      unredEye();
    }

    function onMouseMove(aEvent)
    {
      if (!gActive)
        return;

      gCtx2.clearRect( 0, 0, canvastmp.width, canvastmp.height);

      gEndX = aEvent.clientX;
      gEndY = aEvent.clientY;
      var e = canvastmp;
      while (e)
      {
        gEndX -= e.offsetLeft;
        gEndY -= e.offsetTop;
        e = e.offsetParent;
      }
      gCtx2.strokeRect( Math.min(gStartX, gEndX),
                       Math.min(gStartY, gEndY),
                       Math.abs(gEndX - gStartX),
                       Math.abs(gEndY - gStartY));
    }

    function unredEye()
    {
      var imageData = gCtx.getImageData( Math.min(gStartX, gEndX),
                                         Math.min(gStartY, gEndY),
                                         Math.abs(gEndX - gStartX),
                                         Math.abs(gEndY - gStartY));
        
        var data = imageData.data;

      for (var x = 0; x < imageData.width; x++)
        for (var y = 0; y < imageData.height; y++)
        {
          var offset = (y * imageData.width + x) * 4;
          var r = data[offset];
          var g = data[offset+1];
          var b = data[offset+2];
          var alpha = data[offset+3];
            
          var redIntensity;
          if (g || b)
            redIntensity = 2 * r / (g + b);
          else if (r)
            redIntensity = 2;
          else
            redIntensity = 0;
          if (redIntensity > 1.6)
            if (g || b)
              data[offset] = (g + b) / 2;
            else
              data[offset] = 0;
        }
      gCtx.putImageData(imageData, Math.min(gStartX, gEndX), Math.min(gStartY, gEndY));
    }
});
