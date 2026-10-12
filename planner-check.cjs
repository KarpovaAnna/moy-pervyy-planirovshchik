// Run: node planner-check.cjs. No browser data or external packages required.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const elements={toast:{replaceChildren(){},append(){},hidden:true},search:{value:''},'category-filter':{value:''},'status-filter':{value:''}};
const context={document:{getElementById:id=>elements[id],createTextNode:s=>s},localStorage:{getItem:()=>null,setItem(){}},crypto:{randomUUID:()=> 'test-id'},setTimeout:()=>1,clearTimeout(){},Date,console};
vm.createContext(context);
const source=fs.readFileSync('script.js','utf8').split('cats.forEach(c=>')[0];
vm.runInContext(source,context);
vm.runInContext(`
state.profiles=[{id:'p',name:'Тест',tasks:[],notified:{}}];state.active='p';
const task={id:'a',title:'Тренировка',date:'2026-10-12',time:'19:00',category:'movement',done:false,reminder:15,repeat:{type:'weekly',days:[0,3],until:''},overrides:{}};
profile().tasks.push(task);
`,context);
assert.equal(vm.runInContext('items("2026-10-12","2026-10-18").length',context),2);
assert.equal(vm.runInContext('items("2026-10-12","2026-10-18")[1].date',context),'2026-10-15');
vm.runInContext('task.overrides["2026-10-12"]={done:true};',context);
assert.equal(vm.runInContext('items("2026-10-12","2026-10-18")[1].done',context),false);
vm.runInContext('task.overrides["2026-10-12"].date="2026-10-20";',context);
assert.equal(vm.runInContext('items("2026-10-12","2026-10-18").length',context),1);
assert.equal(vm.runInContext('items("2026-10-19","2026-10-25").find(t=>t.sourceDate==="2026-10-12").date',context),'2026-10-20');
vm.runInContext('task.overrides["2026-10-15"]={deleted:true};',context);
assert.equal(vm.runInContext('items("2026-10-12","2026-10-18").length',context),0);
assert.equal(vm.runInContext('validState(JSON.parse(JSON.stringify(state)))',context),true);
assert.equal(vm.runInContext('validDate("2026-02-30")',context),false);
assert.equal(vm.runInContext('esc("<script> & \\\"test\\\"")',context),'&lt;script&gt; &amp; &quot;test&quot;');
assert.equal(vm.runInContext('validProfile({...profile(),tasks:[{...task,time:"25:00"}]})',context),false);
assert.equal(vm.runInContext('validProfile({...profile(),tasks:[task,task]})',context),false);
vm.runInContext('elementsUnused=0; task.repeat={type:"daily",days:[],until:"2026-10-14"};task.overrides={};',context);
assert.equal(vm.runInContext('items("2026-10-12","2026-10-18").length',context),3);
console.log('PASS: recurrence dates, independent completion, moved exceptions, deletion, export validation, invalid dates, escaping, import rejection, daily end date.');
