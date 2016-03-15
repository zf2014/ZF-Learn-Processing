var obj = { sym: Symbol() };
var s = obj.sym;
console.log(s);
obj[Symbol()] = 'HHHHH';
obj[obj.sym] = 'HHHHHHHH';
var TestClass = (function () {
    function TestClass() {
    }
    TestClass.prototype.doTest = function (name) {
        console.log(name);
    };
    return TestClass;
}());
var t = new TestClass();
t.doTest('zhangF');
t.doTest('ZhangF');
var t2;
t2 = ['12'];
var t3;
t3 = ['3'];
var t4;
