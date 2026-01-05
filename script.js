const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const img = new Image();

canvas.width = 350;
canvas.height = 280;

const upload = document.getElementById("upload");
const convertBtn = document.getElementById("convertBtn");

upload.addEventListener("change", e => {
  img.src = URL.createObjectURL(e.target.files[0]);
});

img.onload = () => {
  ctx.drawImage(img,0,0,canvas.width,canvas.height);
};

convertBtn.addEventListener("click", makeSketch);

function makeSketch(){
  ctx.drawImage(img,0,0,canvas.width,canvas.height);

  let imageData = ctx.getImageData(0,0,canvas.width,canvas.height);
  let data = imageData.data;

  // 1️⃣ Grayscale
  for(let i=0;i<data.length;i+=4){
    let gray = data[i]*0.3 + data[i+1]*0.59 + data[i+2]*0.11;
    data[i] = data[i+1] = data[i+2] = gray;
  }

  let grayData = new Uint8ClampedArray(data);

  // 2️⃣ Invert
  for(let i=0;i<data.length;i+=4){
    data[i] = 255 - data[i];
    data[i+1] = 255 - data[i+1];
    data[i+2] = 255 - data[i+2];
  }

  ctx.putImageData(imageData,0,0);

  // 3️⃣ Blur
  ctx.globalAlpha = 0.8;
  for(let i=0;i<6;i++){
    ctx.drawImage(canvas, -1, 0);
    ctx.drawImage(canvas, 1, 0);
    ctx.drawImage(canvas, 0, -1);
    ctx.drawImage(canvas, 0, 1);
  }
  ctx.globalAlpha = 1;

  let blurData = ctx.getImageData(0,0,canvas.width,canvas.height).data;

  // 4️⃣ Color dodge
  for(let i=0;i<data.length;i+=4){
    let g = grayData[i];
    let b = blurData[i];
    let result = Math.min(255, (g << 8) / (255 - b + 1));
    data[i] = data[i+1] = data[i+2] = result;
  }

  ctx.putImageData(imageData,0,0);
}