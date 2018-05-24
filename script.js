const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let width, height;

let currentTool = 'rectangle';
let currentColor = '#FF0000';

const toolElements = document.querySelectorAll('.tool');
const colorElement = document.querySelector('#color');
const clearElement = document.querySelector('#clear');
const downloadElement = document.querySelector('#download');
const undoElement = document.querySelector('#undo');

function clear() {
  ctx.clearRect(0, 0, width, height);
}

function onChangeTool(event) {

  let element = { id: '' };
  let i = 0;

  while(!event.path[i].id.includes('tool-')) i++;

  const toolName = event.path[i].id.replace('tool-', '');

  currentTool = toolName;

  toolElements.forEach(e => e.classList.remove('active'))
  event.path[i].classList.add('active');
}

let mouseStartX = null;
let mouseStartY = null;

let mouseEndX = null;
let mouseEndY = null;

// is the user drawing
let drawing = false;

let shapes = JSON.parse(localStorage.getItem('shapes')) || [];

function onMouseDown(event) {
  drawing = true;

  mouseX = event.offsetX * window.devicePixelRatio;
  mouseY = event.offsetY * window.devicePixelRatio;

  switch(currentTool) {
    case 'circle': 
      shapes.push({ 
        x: mouseX, 
        y: mouseY,
        radius: 0,
        color: currentColor,
        type: currentTool
      })
    break;
    case 'rectangle': 
      shapes.push({ 
        x1: mouseX, 
        y1: mouseY,
        x2: 0,
        y2: 0,
        color: currentColor,
        type: currentTool
      })
    break;
  }
}

function onMouseMove(event) {
  if(drawing) {

    mouseX = event.offsetX * window.devicePixelRatio;
    mouseY = event.offsetY * window.devicePixelRatio;

    let i = shapes.length - 1;

    switch(currentTool) {
      case 'circle': 
        shapes[i].radius = Math.sqrt((mouseX - shapes[i].x) ** 2 + (mouseY - shapes[i].y) ** 2)
      break;
      case 'rectangle': 
        shapes[i].x2 = mouseX - shapes[i].x1;
        shapes[i].y2 = mouseY - shapes[i].y1;
      break;
    }
  }
}

function onMouseUp(event) {
  drawing = false;
  persistInStorage()
  downloadElement.href = canvas.toDataURL('image/png')
}

function persistInStorage() {
  localStorage.setItem('shapes', JSON.stringify(shapes))
}

function clearStorage() {
  localStorage.setItem('shapes', JSON.stringify([]))
  shapes = []
  clear();
}

function draw() {
  clear();

  shapes.forEach(s => {
    switch(s.type) {
      case 'circle': 
        ctx.beginPath();
        ctx.fillStyle = s.color;
        ctx.arc(s.x, s.y, s.radius, 0, 2*Math.PI);
        ctx.fill();
      break;
      case 'rectangle': 
        ctx.beginPath();
        ctx.rect(s.x1, s.y1, s.x2, s.y2);
        ctx.fillStyle = s.color;
        ctx.fill();
      break;
    }
  });

  requestAnimationFrame(draw);
}

function onChangeColor(event) {
  currentColor = event.target.value;
}

function resize() {
  canvas.width = window.innerWidth * window.devicePixelRatio;
  canvas.height = window.innerHeight * window.devicePixelRatio;

  canvas.style.width = `${canvas.width / window.devicePixelRatio}px`
  canvas.style.height = `${canvas.height / window.devicePixelRatio}px`

  width = canvas.width;
  height = canvas.height;
}

function download() {
  this.href = canvas.toDataURL('image/png').replace(/^data:image\/[^;]/, 'data:application/octet-stream');
}

function undo() {
  shapes.pop()
  persistInStorage();
}

function init() {
  clear();

  resize();

  canvas.addEventListener('mousedown', onMouseDown);
  canvas.addEventListener('mouseup', onMouseUp);
  canvas.addEventListener('mousemove', onMouseMove);

  clearElement.addEventListener('click', clearStorage);
  downloadElement.addEventListener('click', download);
  undoElement.addEventListener('click', undo);

  colorElement.addEventListener('change', onChangeColor);

  toolElements.forEach(e => e.addEventListener('click', onChangeTool))

  requestAnimationFrame(draw);
}

window.addEventListener('load', init);
window.addEventListener('resize', resize);
