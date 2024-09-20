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

let data = [
    {test:'1111',sol:'1111',dif:{correct:4,misplaced:0,wrong:0}}, // correct
    {test:'1234',sol:'5555',dif:{correct:0,misplaced:0,wrong:4}}, // wrong
    {test:'1122',sol:'2555',dif:{correct:0,misplaced:1,wrong:3}}, // multi in test
    {test:'2221',sol:'3332',dif:{correct:0,misplaced:1,wrong:3}}, // mutli in test
    {test:'2122',sol:'3322',dif:{correct:2,misplaced:0,wrong:2}}, // multi in both
    {test:'2121',sol:'1212',dif:{correct:0,misplaced:4,wrong:0}}, // all misplaced
    {test:'5552',sol:'2122',dif:{correct:1,misplaced:0,wrong:3}}, // multi in sol, correct
    {test:'5525',sol:'2212',dif:{correct:0,misplaced:1,wrong:3}}  // multi in sol, incorret
]

for(let i=0;i<data.length;i++){
    let e = data[i];
    test(`Test ${i}`,()=>{
        expect(evaluateDifference(e.test,e.sol)).toEqual(e.dif);
    })
}

// console.log(evaluateDifference(tests[0].test,tests[0].sol));