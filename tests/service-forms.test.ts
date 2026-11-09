import test from 'node:test';
import assert from 'node:assert/strict';
import {generateServiceForm,validateServiceAnswers,visibleServiceFields} from '../lib/service-forms';
const generate=(title:string,content='')=>generateServiceForm({title,content});
test('services get distinct fields instead of the shared appointment form',()=>{
 const yellow=generate('INTERNATIONAL YELLOW CARD APPLICATION');
 assert.equal(yellow.documentRequired,true);
 assert.ok(yellow.fields.some(f=>f.name==='date_of_birth'));
 assert.ok(!yellow.fields.some(f=>f.name==='appointment_type'));
 const sponsor=generate('Scholarship Sponsorship & International Student Placement');
 assert.ok(sponsor.fields.some(f=>f.name==='beneficiaries'));
 assert.ok(!sponsor.fields.some(f=>f.name==='date_of_birth'));
 assert.ok(generate('University & Course Selection').fields.some(f=>f.name==='career_goals'));
 assert.ok(generate('INTERNATIONAL ADMISSION REQUIREMENTS FOR NIGERIAN STUDENTS').fields.some(f=>f.name==='programme_level'));
 assert.ok(generate('STUDY VISA APPLICATION & PROCESSING').fields.some(f=>f.name==='previous_refusal'));
 assert.ok(generate('BOOK YOUR PRE-DEPARTURE CONSULTATION TODAY').fields.some(f=>f.name==='departure_date'));
});
test('passport correction and visa refusal details only appear when relevant',()=>{
 const passport=generate('NIGERIAN INTERNATIONAL PASSPORT APPLICATION');
 assert.ok(!visibleServiceFields(passport,{passport_category:'Renewal'}).some(f=>f.name==='modification_details'));
 assert.ok(visibleServiceFields(passport,{passport_category:'Data modification'}).some(f=>f.name==='modification_details'));
 const visa=generate('Study Visa');
 assert.ok(!visibleServiceFields(visa,{previous_refusal:'No'}).some(f=>f.name==='refusal_details'));
 const validation=validateServiceAnswers(visa,{previous_refusal:'Yes'});
 assert.ok(validation.errors.refusal_details);
});
test('new services derive inputs and document checklist from explicit requirements',()=>{
 const definition=generate('Airport transfer','APPLICATION REQUIREMENTS\n- Arrival airport\n- Flight number\n- Arrival date\n- Passport data page\nHOW TO APPLY\nContact us');
 assert.ok(definition.fields.some(f=>f.label==='Arrival airport'));
 assert.ok(definition.fields.some(f=>f.label==='Flight number'));
 assert.ok(definition.fields.some(f=>f.label==='Arrival date'&&f.type==='date'));
 assert.deepEqual(definition.documents,['Passport data page']);
 assert.ok(!definition.fields.some(f=>f.label==='Contact us'));
});
test('server answer validation rejects missing fields, invalid choices and dates, and strips unknown fields',()=>{
 const definition=generate('Yellow Card');
 const result=validateServiceAnswers(definition,{full_name:'Test User',email:'bad',phone:'abc',date_of_birth:'2026-02-30',gender:'invalid',status:'approved'});
 assert.ok(result.errors.email);assert.ok(result.errors.phone);assert.ok(result.errors.date_of_birth);assert.ok(result.errors.gender);
 assert.equal(result.answers.status,undefined);assert.ok(result.errors.destination);
});
