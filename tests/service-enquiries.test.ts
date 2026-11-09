import test from 'node:test';
import assert from 'node:assert/strict';
import { serviceEnquiryEnvelope } from '../lib/validators/service-enquiries';

const enquiry = { service_slug:'passport-assistance', answers:{ full_name:'Test Applicant', email:'applicant@example.com', phone:'+2348034239813' }, agree_privacy:true, consent_contact:true };
test('service enquiry requires both consents and rejects honeypot submissions',()=>{
  assert.equal(serviceEnquiryEnvelope.safeParse(enquiry).success,true);
  for(const change of [{agree_privacy:false},{consent_contact:false},{website:'spam'}]) assert.equal(serviceEnquiryEnvelope.safeParse({...enquiry,...change}).success,false);
});
test('service enquiry only accepts signed-upload document paths and excludes admin fields',()=>{
  for(const path of ['https://example.com/document.pdf','../secret.pdf','site-media/photo.jpg']) assert.equal(serviceEnquiryEnvelope.safeParse({...enquiry,document_path:path}).success,false);
  const parsed=serviceEnquiryEnvelope.parse({...enquiry,status:'approved',admin_notes:'injected',email_sent:true});
  assert.equal(Object.hasOwn(parsed,'status'),false);
  assert.equal(Object.hasOwn(parsed,'admin_notes'),false);
  assert.equal(Object.hasOwn(parsed,'email_sent'),false);
});
test('service enquiry bounds oversized answer collections',()=>{
  const answers=Object.fromEntries(Array.from({length:101},(_,i)=>['field'+i,'value']));
  assert.equal(serviceEnquiryEnvelope.safeParse({...enquiry,answers}).success,false);
});
