export default function maze(y,x, constant, random) {
    // 8, 5
	let n=x*y-1;
	if ( n < 0 ) {
    alert("illegal maze dimensions");
    return;
  }

  if(!random) {
    random = Math.random()
  }
	let horiz =[]; for (var j= 0; j<x+1; j++) horiz[j]= [];
	let verti =[]; for (var j= 0; j<x+1; j++) verti[j]= [];
	let here = [Math.floor(random*x), Math.floor(random*y)];
	let path = [here];
	let unvisited = [];
	for (var j = 0; j<x+2; j++) {
		unvisited[j] = [];
		for (var k= 0; k<y+1; k++) {
      unvisited[j].push(j>0 && j<x+1 && k>0 && (j != here[0]+1 || k != here[1]+1));
    }	
	}
	while ( 0 < n ) {
		var potential = [[here[0]+1, here[1]], [here[0],here[1]+1],
		    [here[0]-1, here[1]], [here[0],here[1]-1]];
		var neighbors = [];
		for (var j = 0; j < 4; j++) {
      if (unvisited[potential[j][0]+1][potential[j][1]+1]){
        neighbors.push(potential[j]);
      }
    }
			
		if (neighbors.length) {
			n = n-1;
			let next = neighbors[Math.floor((random * n % 1)*neighbors.length)];
			unvisited[next[0]+1][next[1]+1]= false;
			if (next[0] == here[0])
				horiz[next[0]][(next[1]+here[1]-1)/2]= true;
			else 
				verti[(next[0]+here[0]-1)/2][next[1]]= true;
			path.push(here = next);
		} else 
			here = path.pop();
	}

  if (constant) {
    let a = '{"x":5,"y":8,"horiz":[[true,true,null,true,true,null,true],[null,true,true,null,null,true,true],[null,null,true,null,true,null,true],[null,true,true,null,null,null,true],[true,true,true,true,null,true,true],[]],"verti":[[true,null,null,true,true,true,null,true],[true,true,null,null,true,null,null,true],[true,true,null,true,null,true],[true,null,null,true,true,true,null,true],[],[]],"array":[["x"," ","x","x","x","x","x","x","x","x","x","x","x","x","x","x","x"],["x"," "," "," "," "," ","x"," "," "," "," "," ","x"," "," "," ","x"],["x"," "," "," ","x"," ","x"," "," "," "," "," "," "," ","x"," "," "],["x"," ","x"," "," "," "," "," ","x"," ","x"," "," "," "," "," ","x"],["x"," "," "," "," "," ","x"," ","x"," "," "," ","x"," ","x"," "," "],["x"," ","x"," ","x"," "," "," ","x"," "," "," ","x"," "," "," ","x"],["x"," "," "," "," "," ","x"," "," "," ","x"," "," "," ","x"," ","x"],["x"," ","x"," "," "," "," "," ","x"," ","x"," ","x"," "," "," ","x"],["x"," "," "," ","x"," ","x"," "," "," "," "," "," "," ","x"," "," "],["x"," "," "," "," "," "," "," "," "," ","x"," "," "," "," "," ","x"],["x"," ","x"," ","x"," ","x"," ","x"," ","x"," ","x"," ","x"," ","x"],["x","x","x","x","x","x","x","x","x","x","x","x","x","x","x"," ","x"]]}';
    a = JSON.parse(a);
    horiz = a.horiz;
    verti = a.verti;
  }

    // create Array 
    let array = [];
    array[0] = new Array(2*y+1).fill('x');
    array[0][1] = ' ';
    array[2*x] = new Array(2*y+1).fill('x');
    array[2*x][2*y-1] = ' ';


    for (let i = 0; i < x; i++) {
        let row = ['x'];
        for (let j = 0; j < y; j++) {
            row.push(' ');
            if(horiz[i][j]) row.push(' ');
            else row.push('x');
        }
        array[2*i+1] = JSON.parse(JSON.stringify(row));
    }

    for (let i = 0; i < x-1; i++) {
        let row = ['x'];
        for (let j = 0; j < y; j++) {
            if(verti[i][j]) row.push(' ');
            else row.push('x');
            row.push('x');
        }
        array[2*i+2] = JSON.parse(JSON.stringify(row));
    }

    //change the exit


	return {x, y, horiz, verti, array};
}

export function display(m) {
    var text= [];
    for (var j= 0; j<m.x*2+1; j++) {
      var line= [];
      if (0 == j%2)
        for (var k=0; k<m.y*4+1; k++)
          if (0 == k%4) 
            line[k]= '+';
          else
            if (j>0 && m.verti[j/2-1][Math.floor(k/4)])
              line[k]= ' ';
            else
              line[k]= '-';
      else
        for (var k=0; k<m.y*4+1; k++)
          if (0 == k%4)
            if (k>0 && m.horiz[(j-1)/2][k/4-1])
              line[k]= ' ';
            else
              line[k]= '|';
          else
            line[k]= ' ';
      if (0 == j) line[1]= line[2]= line[3]= ' ';
      if (m.x*2-1 == j) line[4*m.y]= ' ';
      text.push(line.join('')+'\r\n');
    }
    text[text.length-2] = text[text.length-2].substr(0,text[text.length-1].length-3)+'|\r\n'
    text[text.length-1] = text[text.length-1].substr(0,text[text.length-1].length-6)+'   +\r\n'
    return text.join('');
}


// 0   1   2   3   4   5   6   7 
// 0  +   +---+---+---+---+---+---+---+ 
// 1  |           |           |       | h0 [true, true, null, true, true, null, true]
// 2  +   +---+---+   +   +   +---+   + v0 [true, null, null, true, true, true, null, true]
// 3  |   |           |   |           | h1 [null, true, true, null, null, true, true]
// 4  +   +   +---+---+   +---+---+   + v1  [true, true, null, null, true, null, null, true]
// 5  |   |   |       |       |       | h2 [null, null, true, null, true, null, true]
// 6  +   +   +---+   +---+   +---+---+ v2 [true, true, null, true, null, true]
// 7  |   |           |   |   |       | h3 [null, true, true, null, null, null, true]
// 8  +   +---+---+   +   +   +---+   + v3 [true, null, null, true, true, true, null, true]
// 9  |                   |           | h4 [true, true, true, true, null, true, true]
// 10 +---+---+---+---+---+---+---+   +

// 0: (17) ['x', ' ', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x']
// 1: (17) ['x', ' ', ' ', ' ', ' ', ' ', 'x', ' ', ' ', ' ', ' ', ' ', 'x', ' ', ' ', ' ', 'x']
// 2: (17) ['x', ' ', 'x', 'x', 'x', 'x', 'x', ' ', 'x', ' ', 'x', ' ', 'x', 'x', 'x', ' ', 'x']
// 3: (17) ['x', ' ', 'x', ' ', ' ', ' ', ' ', ' ', 'x', ' ', 'x', ' ', ' ', ' ', ' ', ' ', 'x']
// 4: (17) ['x', ' ', 'x', ' ', 'x', 'x', 'x', 'x', 'x', ' ', 'x', 'x', 'x', 'x', 'x', ' ', 'x']
// 5: (17) ['x', ' ', 'x', ' ', 'x', ' ', ' ', ' ', 'x', ' ', ' ', ' ', 'x', ' ', ' ', ' ', 'x']
// 6: (17) ['x', ' ', 'x', ' ', 'x', 'x', 'x', ' ', 'x', 'x', 'x', ' ', 'x', 'x', 'x', 'x', 'x']
// 7: (17) ['x', ' ', 'x', ' ', ' ', ' ', ' ', ' ', 'x', ' ', 'x', ' ', 'x', ' ', ' ', ' ', 'x']
// 8: (17) ['x', ' ', 'x', 'x', 'x', 'x', 'x', ' ', 'x', ' ', 'x', ' ', 'x', 'x', 'x', ' ', 'x']
// 9: (17) ['x', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'x', ' ', ' ', ' ', ' ', ' ', 'x']
// 11:(17) ['x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', ' ', 'x']

