interface T {
	name: string;
	[x: string]: any;
}

let type : T = {
	name: 'zhangF',
	age: 12,
	sex: 'man'
}


let v2 = {

	get name (){
		return '';
	},
	
	set name (name){

	}
}

var x = 1;
var y = 15;

function f(a = x) {
    // let x = "hello";
}