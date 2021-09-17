//Пасьянс «Плеяды»
//Специально для сайта dollpleiades.ru
//Автор - Скрипкарь Станислав Игоревич

// карты в виде цифр 1-13 - пики, 21-33 - червы, 41-53 - крести, 61-73 - бубны
var timer; // таймер
var timerstep = 0; // счетчик таймера
var counter; // кол-во карт по порядку одной масти
var counterx; // позиция x, из которой перемещаем counter
var countery; // позиция y, из которой перемещаем counter
var stack; // двойной массив карт
var tempstack; // простой массив карт для смешивания и максимальный порядок
var button = false; // состояние кнопки мыши
var started = false; // состояние запуска игры
var newPosXY = new Object(); // координаты новой позиции мышки
var lastentry; // последний указанный столбец
var xcard = 37; // смещение карты по x
var ycard = 25; // смещение карты по y
var pscore; // кол-во очков
var pmoves; // кол-во ходов
var pcancel = new Array(); // хранилище совершенных ходов
var pview = new Array(); // хранилище допустимых ходов

function CancelViewMove(oldx, x, c, blank) { // объект отмены хода и допустимого хода
this.oldx = oldx;
this.x = x;
this.c = c;
this.blank = blank;
}

function CancelMoveClick() { // отмена хода
y = 0;
b = 0;
c = 0;
if (timerstep == 0 && pcancel.length > 0) {
	c = pcancel.pop();
	y = stack[c.oldx].length;
	if (c.blank && y != 0) {
		y--;
		$(".pos-"+ c.oldx +"-"+ y).remove();
		DrawOneCard(c.oldx, y, 1);
	}
	y = stack[c.x].length - c.c;
	a = stack[c.oldx].length;
	for (i = 0; i < c.c; i++) {
		b = stack[c.x].splice(y, 1);
		stack[c.oldx].push(b);
	}
	for (i = 0; i < c.c; i++) {
		$(".pos-"+ c.x +"-"+ y).remove();
		DrawOneCard(c.oldx, a, 0);
		y++;
		a++;
	}
	pmoves++;
	pscore--;
	TextEdit(true);
}

}

function AnimateCardDown(i) { // анимация появления новых карт
timerstep++;
for (j = 0; j < 10; j++) {
	a = stack[j].length;
	b = (25 * a) / 100;
	z = -75 - (25 * a) + Math.round( i * b );
	a--;
	$(".pos-"+ j +"-"+ a).css({"margin-top":z});
}

if (timerstep < 101) timer = setTimeout("AnimateCardDown("+ timerstep +")", 10);
else {
	clearTimeout(timer);
	timerstep = 0;
	GameReDrawAnim();
}

}

function AnimateCardUp(i, x) { // анимация удаления собранной колоды

j = stack[x].length - 12;
for (l = 0; l < 12; l++) {
	z = -75 - timerstep;
	$(".pos-"+ x +"-"+ j).css({"margin-top":z});
	j++;
}
timerstep++;
if (timerstep < 26) timer = setTimeout("AnimateCardUp("+ timerstep +", "+ x +")", 20);
else {
	for (l = 0; l < 12; l++) {
		j = stack[x].length - 1 - l;
		$(".pos-"+ x +"-"+ j).css({"margin-top":"-75px"});
	}
	GameReDraw(x);
	clearTimeout(timer);
	timerstep = 0;
}

}

function WhatMoveAnimate(i, x, y, c) { // анимация подсказки
j = stack[y].length;
k = stack[x].length - 1;
if (i < 25) z = 1.0 - (0.04 * i);
else z = 0.0 + (0.04 * (i - 25));
if (j == 0) $("#column-"+ y +".space").css({"opacity":z});

else {j--; $(".pos-"+ y +"-"+ j).css({"opacity":z});}
for (l = 0; l < c; l++) {
	$(".pos-"+ x +"-"+ k).css({"opacity":z});
	k--;
}
timerstep++;
if (timerstep < 51) timer = setTimeout("WhatMoveAnimate("+ timerstep +", "+ x +", "+ y +", "+ c +")", 10);
else {
	clearTimeout(timer);
	timerstep = 0;
}

}

function WhatMoveClick() { // подсказка
if (timerstep == 0) {
	pc = pview.shift();
	pview.push(pc);
	WhatMoveAnimate(timerstep, pc.oldx, pc.x, pc.c);
}

}

function WhatMoveView() { // подсчет допустимых ходов
pview = new Array();
for (i = 0; i < 10; i++) {
	TempStackCreate(i);
}

for (i = 0; i < 10; i++) {
	for (j = 0; j < 10; j++) {
		if (i != j) {
			l = stack[i].length;
			m = stack[j].length;
			k = l - tempstack[i];
			if (k != l) {
				a = stack[i][k];
				a = (stack[i][k] % 20) + 1;
				if (m > 0) b = stack[j][m-1] % 20; else b = 0;
				if (a == b) {
					pc = new CancelViewMove(i, j, tempstack[i], true);
					pview.push(pc);
				}
			}
		}
	}
}

}

function TempStackCreate(x) { // создание количества карт по порядку одной масти
s = stack[x].length;
tempstack[x] = 0;
none = true;
j = 0;
while (j < s && none) {
	CardOrder(x, j);
	if (counter > 0) {
		tempstack[x] = counter;
		none = false;
	}
	j++;
}

}

function CardBlank(x, y) { // проверка карты
return $(".pos-"+ x +"-"+ y).hasClass("blank");
}

function DrawOneCard(i, j, blank) { // рисует 1 карту
if (i == 11) {
	$("#column-"+i).append("<div class = 'cardsr pos-11-"+ j +" color-"+ stack[i][j] +"' ></div>");
}
if (i == 10) {
	$("#column-"+i).append("<div class = 'cardsl blank pos-10-"+ j +"' \
	onclick = 'CardMClick("+ j +")' ></div>");
}
if (i < 10 && blank < 2) {
	$("#column-"+i).append("<div class = 'card pos-"+ i +"-"+ j +"' \
	onmousedown = 'CardMDown("+ i +", "+ j +", "+ blank +")' ></div>");
	if (blank == 0) 
		$(".pos-"+ i +"-"+ j).toggleClass("color-"+ stack[i][j],true);
	else
		$(".pos-"+ i +"-"+ j).toggleClass("blank",true);
}
if (blank == 2) $("#temp").append("<div class = 'holder card color-"+ stack[i][j] +"' ></div>");
}

function TextEdit(end) { // вывод текста на экран Счет и Ходов и создание допустимых ходов
WhatMoveView();
if (end) $("p#textvalue").text("Счет: "+ pscore + ", Ходов: "+ pmoves);
else $("p#textvalue").text("Вы выйграли!!! Счет: "+ pscore + ", Ходов: "+ pmoves);
}

function CheckColumn() { // проверка правильности позиции курсора для пересмещения карт
lastentry = 10;
colPosXY = $("#column-0").offset();
if (colPosXY.top < newPosXY.top) {
	lastentry = Math.floor( (newPosXY.left + xcard - colPosXY.left) / (xcard + xcard) );
	if (lastentry < 0 || lastentry > 9) lastentry = 10;
	a = stack[lastentry].length * ycard + 7*ycard;
	b = newPosXY.top + ycard - colPosXY.top;
	//$("p#textvalue").text("a = "+ a + ", b = "+ b +", lastentry"+ lastentry);
	if (a < b) lastentry = 10;
}

}

function CardOrder(x, y) { // подсчет количества карт по порядку одной масти
if (CardBlank(x, y)) {
	z = 0;
	counter = 0;
}
else {
	z = 1 + y;
	while ( (z < stack[x].length) && (z != y) ) {
		u = stack[x][z-1];
		v = stack[x][z];
		v++;
		if ( u == v ) z++; else z = y;
	}
	counter = z - y;
}

}

function CardMClick(y) { // сброс 10 карт по щелчку мыши
if (timerstep == 0) {
	a = 0;
	b = 0;
	j = 0;
	l = 10;
	noempty = true;
	if (stack[10].length != 0) l = stack[10].length / 10 - 1;
	if (y == 5 && l != 10) y = l;
	if (l == y) {
		while (b < 10 && noempty) {
			if (stack[b].length == 0) noempty = false;
			b++;
		}
		if (noempty) {
			a = stack[10].length - 10;
			
			for (i = 0; i < 10; i++) {
				b = stack[10].splice(a, 1);
				stack[i].push(b);
				j = stack[i].length - 1;
				DrawOneCard(i, j , 0);
			}
			$(".pos-10-"+ l).remove();
			AnimateCardDown(timerstep);
			pcancel = new Array();
			TextEdit(true);
		} else $("p#textvalue").text("Для сдачи карт необходимо заполнить пустые поля");
	}
}

}

function CardMDown(x, y, blank) { // создание ряда карт для перемещения по зажатию мышки

if (timerstep == 0 && blank == 0) {
	CardOrder(x, y);
	if (counter > 0) {
		counterx = x;
		countery = y;
		j = 0;
		j = y;
		for (i = 0; i < counter; i++) {
			DrawOneCard(x, j, 2);
			$(".pos-"+ x +"-"+ j).toggleClass("notholder", true);
			j++;
		}
		$("#temp").offset(newPosXY);
		button = true;
	}
}

}

function CardMUp(x) { // перемещение ряда карт при отпущенной кнопке мышки

if (x != counterx && counter > 0 && x < 10) {
	a = 0;
	b = 0;
	y = stack[x].length;
	if (y != 0) b = stack[x][y-1] % 20;
	a = (stack[counterx][countery] % 20) + 1;

	if ( a == b || b == 0) {
		a = stack[counterx].length - counter;
		blank = false;
		if (a >= 1) {
			b = a - 1;
			if (CardBlank(counterx, b)) blank = true;
		}
		for (i = 0; i < counter; i++) {
			b = stack[counterx].splice(a, 1);
			stack[x].push(b);
		}
		a = countery;
		for (i = 0; i < counter; i++) {
			$(".pos-"+ counterx +"-"+ a).remove();
			DrawOneCard(x, y, 0);
			y++;
			a++;
		}
		pmoves++;
		pscore--;
		pc = new CancelViewMove(counterx, x, counter, blank);
		pcancel.push(pc);
		GameReDrawAnim();
	}
}

}

function GameReDrawAnim() { // проверка на пустые карты и анимацию
for (x = 0; x < 10; x++) {
	y = stack[x].length;
	if (y != 0) {
		y = y - 1;
		if (CardBlank(x, y)) {
			$(".pos-"+ x +"-"+ y).remove();
			DrawOneCard(x, y, 0);
		}
	}
	y = stack[x].length;
	if (y > 12) {
		a = y - 13;
		CardOrder(x, a);
		blank = CardBlank(x, a);
		if (counter == 13 && !blank) AnimateCardUp(timerstep, x);
	}
}
TextEdit(true);
}

function GameReDraw(x) { // удаление собранной колоды после анимации
a = stack[x].length - 13;
b = a;
z = stack[x][a];
for (i = 0; i < 13; i++) {
	stack[x].splice(a, 1);
	$(".pos-"+ x +"-"+ b).remove();
	b++;
}
stack[11].push(z);
z = stack[11].length - 1;
DrawOneCard(11, z, 1);
pcancel = new Array();
pscore+=100;

y = stack[x].length;
if (y != 0) {
	y = y - 1;
	if (CardBlank(x, y)) {
		$(".pos-"+ x +"-"+ y).remove();
		DrawOneCard(x, y, 0);
	}
}

TextEdit(true);
if (stack[11].length == 8) {
	TextEdit(false);
	started = false;
}

}

function GamePrepare(value) { // сброс всех числовых значений и создание колоды

counter = 0;
counterx = 0;
countery = 0;
stack = new Array();
tempstack = new Array();
button = false;
started = true;
pscore = 500;
pmoves = 0;
pcancel = new Array();
pview = new Array();

for (i = 0; i < 8; i++) {
	for (j = 0; j < 13; j++) {
		tempstack[i*13+j] = j+1 + (i % value)*20;
	}
}
x = 0;
z = 0;
for (i = 0; i < 104; i++) {
	z = Math.floor(Math.random()*(104-i));
	x = tempstack[z];
	tempstack.splice(z,1);
	tempstack.push(x);
}
for (i = 0; i < 12; i++) {
	stack[i] = new Array();
}
for (i = 0; i < 4; i++) {
	stack[i] = tempstack.splice(0,6);
}
for (i = 4; i < 10; i++) {
	stack[i] = tempstack.splice(0,5);
}
stack[10] = tempstack.splice(0,50);

for (i = 0; i < 10; i++) {
tempstack[i] = 1;
}

}

function GameDraw() { // начальная прорисовка карт
$(".card").remove();
$(".cardsl").remove();
$(".cardsr").remove();

for (i = 0; i < 10; i++) {
	for (j = 0; j < stack[i].length-1; j++) {
		DrawOneCard(i, j, 1);
	}
	DrawOneCard(i, j, 0);
}
for (j = 0; j < 5; j++) {
	DrawOneCard(10, j, 1);
}
TextEdit(true);
}

function GameMouse() { // проверка всех событий с мышкой
$(document).ready(function(){

	$(document).mousemove(function(PosXY){
		newPosXY.left = PosXY.pageX - xcard;
		newPosXY.top = PosXY.pageY + ycard*3;
		//CheckColumn();
		if (button) {
			$("#temp").offset(newPosXY);
		}
	});

	$(document).mousedown(function(){
	});

	$(document).mouseup(function(){
		if (timerstep == 0 && button) {
			CheckColumn();
			$(".holder").remove();
			$(".notholder").toggleClass("notholder");
			CardMUp(lastentry);
			button = false;
		}
	});

});

}

function GameStart(value) { // запуск игры со значением кол-ва мастей
if (timerstep == 0) {
	GamePrepare(value);
	GameDraw();
	GameMouse();
}

}