const E=require('../extension/planner-engine'),a=require('node:assert/strict');
const cases=[['BSc in Computer Science & Engineering','cse'],['Computer Network & Cyber Security','cncs'],['Electrical and Electronic Engineering','eee-obe'],['EEE Semester plan','eee-sem'],['Bachelor of Business Administration','bba-2022'],['Computer Engineering','coe'],['Data Science','ds'],['B.Pharm Pharmacy','pharm'],['Biochemistry & Molecular Biology','bmb'],['LLB Law','llb'],['Unknown degree',''],['Computer Science & Engineering / Computer Engineering','']];
for(let [Program,id]of cases)a.equal(E.detectProgram({Program}),id,Program);
a.equal(E.detectProgram({Program:'Data Science',Department:'Computer Science'}),'ds');
a.equal(E.detectProgram({Degree:'BSc in Computer Engineering',Department:'Computer Science'}),'coe');
a.equal(E.detectProgram({Department:'Computer Science'}),'cse');
console.log('PASS 15 department-detection cases, including ambiguous input and shared departments');
