
interface Test{
	sym: symbol;
}

let obj:Test = {sym: Symbol()}
let s = obj.sym;

console.log(s)

obj[Symbol()] = 'HHHHH'

obj[obj.sym] = 'HHHHHHHH'




interface Test2{
	doTest(name: 'zhangF'): Number;
	doTest(name: string): void;
}

class TestClass implements Test2{
	doTest(name){
		console.log(name);
	}
}

var t: Test2 = new TestClass();

t.doTest('zhangF');
t.doTest('ZhangF');


let t2: Array<string>;
t2 = ['12']

let t3: string[];
t3 = ['3']


var t4: <String, Array> (name) => void;


