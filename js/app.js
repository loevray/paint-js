const canvas = document.getElementById("jsCanvas");
const ctx = canvas.getContext("2d");
const colors = document.getElementsByClassName("jsColor");
const range = document.getElementById("jsRange");
const mode = document.getElementById("jsMode");
const saveBtn = document.getElementById("jsSave");
const clear = document.getElementById("jsClear");
const resizeDiv = document.getElementsByClassName("resize");
const resizeBtn = document.getElementsByClassName("sizeBtn");
let leftBtn = document.getElementById("leftBtn");
let rightBtn = document.getElementById("rightBtn");
const body = document.body;
const diva = document.getElementsByClassName("main_top");

const DEFAULT_COLOR = "#2c2c2c";
const CANVAS_SIZE = 700;

//캔버스 색, 채우기색, 브러쉬 사이즈 기본값들
ctx.strokeStyle = DEFAULT_COLOR;
ctx.fillStyle = DEFAULT_COLOR;
ctx.lineWidth = 2.5;

// 컬러, 사이즈 변수 할당
let nowColor = DEFAULT_COLOR;
let canvasResize = CANVAS_SIZE;

// 아래 기본값 false로 주고 함수들 실행
let painting = false;
let filling = false;

canvas.width = canvasResize;
canvas.height = CANVAS_SIZE;

const BUTTON = 0b01;
const mouseButtonIsDown = buttons => (BUTTON & buttons) === BUTTON;

let latestPoint;

//그리기 스탑
function endStroke(evt) {
    if (!painting) {
        return;
    }
    painting = false;
    evt.currentTarget.removeEventListener("mousemove", mouseMove);
};

function mouseDown(evt) {
    if(painting) {
        return;
    }
    evt.preventDefault();
    canvas.addEventListener("mousemove", mouseMove);
    startStroke([evt.offsetX, evt.offsetY]);
}


const mouseMove = evt => {
    if (!painting) {
        return;
    }
    continueStroke([evt.offsetX, evt.offsetY]);
};

const continueStroke = newPoint => {
    ctx.beginPath();
    ctx.moveTo(latestPoint[0], latestPoint[1]);
    ctx.lineTo(newPoint[0], newPoint[1]);
    ctx.stroke();
    latestPoint = newPoint;
};

const startStroke = point => {
    painting = true;
    latestPoint = point;
};


//마우스 캔버스에 들어왔을때 패스 시작
function onMouseEnter(evt) {
    if (!mouseButtonIsDown(evt.buttons) || painting) {
        return;
    }
    mouseDown(evt);
}

//컬러 고르기
function handleColorClick(event) {
    nowColor = event.target.style.backgroundColor;
    ctx.strokeStyle = nowColor;
    ctx.fillStyle = nowColor;
}

//브러쉬 사이즈 바꾸기
function handleRangeChange(event) {
    const brushSize = event.target.value;
    ctx.lineWidth = brushSize;
}

//FILL 버튼 눌렀을때
function handleModeClick() {
    if(filling === true){
        filling = false;
        mode.innerText = "Fill";
    } else {
        filling = true;
        mode.innerText = "Paint";
    }
}

//캔버스 클릭했을때(fillstyle nowcolor로 먼저 선언하지 않으면 black이 디폴트색임. 이유는 모름)
function handleCanvasClick() {
    ctx.fillStyle = nowColor;
    if(filling){
        ctx.fillRect(0, 0, canvasResize, canvasResize);
    }
}

//우클릭 방지
function handleCM(event) {
    event.preventDefault();
}

//SAVE 버튼 눌렀을때 이미지 저장.
function handleSaveClick() {
    const image = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = image;
    link.download = "My Paint";
    link.click();
}

//CLEAR 버튼. 거대한 흰색 사각형으로 캔버스를 채움.
function handleClearClick() {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvasResize, canvasResize);
    ctx.fillStyle = nowColor;
}

//캔버스 크기 조절. 캔버스는 리사이즈 할때 기본적으로 그림이 다 날아감.
//getImageData로 캔버스 그림 변수에 할당시키고, 리사이즈 하고나서 putImageData로 불러옴.
//좌표값도 중요함. x=0, y=0이 좌측최상단이기 때문에 
//저장이나 로드는 y좌표는 0으로 둔 채, x좌표만 계산하면 됨.
//사이즈 키울때 x좌표 : (큰 사이즈-작은 사이즈)/2
//사이즈 줄일때 x좌표 : -(큰 사이즈-작은 사이즈)/2

function handleResizeClick() {
    if(canvasResize !== 1600) {
        let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        canvasResize = 1600;
        canvas.style.width = "1600px";
        canvas.width = canvasResize;
        ctx.fillStyle = nowColor;
        ctx.strokeStyle = nowColor;
        ctx.putImageData(imageData, 450, 0);
    } else { 
        imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        canvasResize = CANVAS_SIZE;
        canvas.style.width = "700px";
        canvas.width = canvasResize;
        ctx.fillStyle = nowColor;
        ctx.strokeStyle = nowColor;
        ctx.putImageData(imageData, -450, 0);
    }
    btnChange(); 
}

//버튼 감췄다 나타내기. a클래스 불러와서 b클래스 toggle하려 해도 안 먹힘.
//클래스는 무조건 foreach만 가능한듯
function revealSizingBtn() {
    Array.from(resizeBtn).forEach(clas =>
    clas.classList.remove("hidden"));
}

function hideSizingBtn() {
    Array.from(resizeBtn).forEach(clas =>
    clas.classList.add("hidden"));
}

//버튼 모양 바꾸기.
//처음에 변수 leftBtn을 document.getElementById("leftBtn").innerText로 할당했었음.
//그랬더니 문자열 바꾸는 게 안먹힘. 이것도 이유를 모르겠다.
//img로 하는게 편할것 같지만 용량차지를 무시못함.
function btnChange() {
    if(leftBtn.innerText === "◀" && rightBtn.innerText === "▶"){
        leftBtn.innerText = "▶";
        rightBtn.innerText ="◀";
    } else {
        leftBtn.innerText = "◀";
        rightBtn.innerText ="▶";
    }
}

//캔버스 이벤트 리스너들.
//캔버스 밖에서 mouseup 감지 안하면 나가서 mousedown풀어도 그림이 유지가됨.
//머리 아픔.
    canvas.addEventListener("mousedown", mouseDown, false);
    canvas.addEventListener("mouseup", endStroke, false);
    canvas.addEventListener("mouseout", endStroke, false);
    canvas.addEventListener("mouseenter", onMouseEnter, false);

    // canvas.addEventListener("click", handleCanvasClick);
    canvas.addEventListener("contextmenu", handleCM);


Array.from(colors).forEach(color => 
    color.addEventListener("click", handleColorClick));

Array.from(resizeBtn).forEach(btn => 
    btn.addEventListener("click", handleResizeClick));

Array.from(resizeDiv).forEach(div => 
    div.addEventListener("mouseenter", revealSizingBtn));

Array.from(resizeDiv).forEach(div => 
    div.addEventListener("mouseleave", hideSizingBtn));
    
if(range) {
    range.addEventListener("input", handleRangeChange);
}

if(mode) {
    mode.addEventListener("click", handleModeClick);
}

if(saveBtn) {
    saveBtn.addEventListener("click", handleSaveClick);
}

if(clear) {
    clear.addEventListener("click", handleClearClick);
}