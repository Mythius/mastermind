const canvas = obj('canvas');
const ctx = canvas.getContext('2d');

const colors = ['gray','red','blue','green','yellow','black','white'];
const color_emoji = ['X','🟥','🟦','🟩','🟨','⬛','⬜']

let grid = new Grid(5, 10, 60);
let current_row = 0;
let solution = '2444';
let scoregrid = new Grid(2,20,30);
let gamemode = 'player';
let bot_wait = false;
let guess_data = [];
let possible = [];

Tile.prototype.draw = function(color=''){
	let ct = this.getCenter();
	if(this.x != 4){
		ctx.beginPath();
		let s = 25;
		if(this.grid.name=='scoregrid') s=10;
		ctx.arc(ct.x,ct.y,s,0,Math.PI*2);
		ctx.fillStyle = colors[this.color];
		ctx.fill();
	} else if(this.y == current_row && (gamemode == 'player' || bot_wait)){
		ctx.beginPath();
		let s2 = this.grid.scale/2;
		ctx.beginPath();
		ctx.fillStyle = 'gray';
		ctx.rect(ct.x-s2,ct.y-s2+s2/2,s2*2,s2);
		ctx.fill();
		ctx.textAlign = 'center';
		ctx.fillStyle='black';
		ctx.font = 'bold 17px sans-serif';
		ctx.fillText('Check',ct.x,ct.y+5);
	}
}

Grid.prototype.draw = function(){
	this.forEach(tile=>{
		tile.draw();
	});
}

function setup(){
	grid.offsetX = canvas.width - 5 * 60 - 10;
	grid.offsetY = canvas.height - 10 * 60 - 10;
	scoregrid.offsetX = 30;
	scoregrid.offsetY = canvas.height - 10 * 60 - 10;
	grid.forEach(tile=>{tile.color=0});
	scoregrid.forEach(tile=>{tile.color=0});
	mouse.start(canvas);
	solution = generateSolution();
	scoregrid.name = 'scoregrid';
	loop();
}

function loop() {
    setTimeout(loop, 1000 / 30);
    ctx.clearRect(-2, -2, canvas.width + 2, canvas.height + 2);
    grid.draw();
    let t = grid.getActiveTile();
    if(mouse.down && t && gamemode == 'player'){
    	if(t.y == current_row){
	    	t.color = (t.color + 1) % colors.length;
	    	mouse.down = false;
    	}
    	if(t.x == 4 && t.y == current_row){
    		checkRow(current_row);
    		current_row++;
    	}
    }
    if(mouse.right && t && t.y == current_row && gamemode == 'player'){
    	t.color = 0;
    }
    if(gamemode == 'bot'){
    	let sga = scoregrid.getActiveTile();
    	if(sga && mouse.down && bot_wait){
    		switch(sga.color){
	    		case 0: sga.color = 6; break;
	    		case 6: sga.color = 1; break;
	    		case 1: sga.color = 0; break;
    		}
    		mouse.down = false;
    	}
    	if(t && mouse.down && bot_wait && t.x == 4 && t.y == current_row){
    		bot_wait = false;
    		current_row++;
			if(current_row < 10) makeBotGuess();
    	}
    }
    scoregrid.draw();
    ctx.font = 'bold 50px sans-serif'
    ctx.fillStyle = 'white';
    ctx.fillText('Master Mind',canvas.width/2,60);
}

function generateSolution(holes=false){
	let s = '';
	for(let i=0;i<4;i++) s += random(holes?0:1,colors.length-1);
	return s;
}

function getGuess(r){
	let test = '';
	for(let i=0;i<4;i++){
		test += grid.getTileAt(i,r).color;
	}
	return test;
}

function checkRow(r){
	const UTEST = getGuess(r);
	let dif = evaluateDifference(UTEST,solution);
	let {correct,misplaced,wrong} = dif;
	let arr = [current_row*2,current_row*2+20,current_row*2+1,current_row*2+21];
	let i=0;
	for(;i<correct;i++){
		scoregrid.tiles.flat()[arr[i]].color='6';
	}
	for(;i<correct+misplaced;i++){
		scoregrid.tiles.flat()[arr[i]].color='1';
	}
	let win = 0;
	if(UTEST==solution){ gameWin(); win = 1;}
	return {correct,misplaced,win}
}

function makeBotGuess(){
	gamemode = 'bot';
	if(current_row == 0){
		let s = generateSolution();
		while(new Set(s).size < 3){
			s = generateSolution();
		}
		loadGuess(s); // first guess with less than 2 repeat
		return;
	}
	let gd = getGuessData(current_row-1);

	if(gd.score.join('')=='2222'){
		gameWin();
		return;
	}

	filterPossibilites(gd);

	let r = random(0,possible.length-1);

	loadGuess(possible[r]);
}

function evaluateDifference(arr1,arr2){
	let correct = 0;
	let misplaced = 4;
	let sc = arr1.split('');
	let test = arr2.split('');
	for(let i=0;i<4;i++){
		if(sc[i]==test[i]){
			correct++;
			misplaced--;
			sc[i]=-1;
			test[i]=-1;
		}
	}
	for(let i=0;i<4;i++){
		if(sc[i] == -1) continue;
		if(!test.includes(sc[i])){
			misplaced--;
			sc[i] = -1;
		} else {
            let ix = test.indexOf(sc[i]);
            test[ix] = -1;
        }
	}
	let wrong = 4 - correct - misplaced;
	return {correct,misplaced,wrong};
}

function filterPossibilites(gd){
	let newpossible = [];
	for(let p of possible){
		let d = evaluateDifference(p,gd.guess)
		let {c,m,w} = countOccurances(gd.score);
		if(d.misplaced == m && d.correct == c && d.wrong == w){
			newpossible.push(p);
		}
	}
	possible = newpossible;
	console.log(possible);
}

function countOccurances(arr){
	let occr = {'0':0,'1':0,'2':0};
	for(let i of arr){
		occr[i]++;
	}
	return {c:occr['2'],m:occr['1'],w:occr['0']};
}

function loadGuess(g='1111'){
	for(let i=0;i<4;i++){
		grid.getTileAt(i,current_row).color = g[i];
	}
	bot_wait = true;
}

function gameWin(){
	alert('You Win');
}

function getGuessData(r){
	let guess = getGuess(r)
	let scores = {'6':'2','1':'1','0':'0'};
	let arr = [r*2,r*2+20,r*2+1,r*2+21];
	score = arr.map(e=>scores[scoregrid.tiles.flat()[e].color]);
	let data = {guess,score};
	guess_data.push(data);
	return data;
}

function generateAllPosibilities(holes=false){
	possible = [];
	let n = holes ? 7 : 6;
	let p = n ** 4;
	for(let i=0;i<p;i++){
		let str = '0'.repeat(n) + i.toString(n);
		str = str.slice(-4).split('').map(e=>+e+1).join('');
		possible.push(str);
	}
	return possible;
}

function setupBot(){
	generateAllPosibilities();
	emojiSolution();
}

Touch.init(data=>{
	if(data.type=='click'||data.type=='end'){
		mouse.pos.x = data.x;
		mouse.pos.y = data.y;
		mouse.down = true;
		loop();
		mouse.down = false;
	}
});


obj('button').on('click',()=>{
	obj('button').remove();
	setupBot();
	makeBotGuess();
});

function emojiSolution(){
	let sol = generateSolution();
	console.log(sol);
	console.log(sol.split('').map(e=>color_emoji[e]).join(''));
}

setup();