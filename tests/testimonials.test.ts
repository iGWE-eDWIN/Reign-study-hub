import test from 'node:test';
import assert from 'node:assert/strict';
import { MAX_PORTRAIT_SIZE, portraitExtension, testimonialPortraitPath, testimonialSubmissionSchema } from '../lib/validators/testimonials';
const submission={name:'Test Student',title:'Master’s graduate',quote:'The team helped me prepare my application and understand each step.',agree_publish:'true'};
test('public experiences require publication consent, substantive plain text and no honeypot',()=>{
  assert.equal(testimonialSubmissionSchema.safeParse(submission).success,true);
  for(const change of [{agree_publish:'false'},{agree_publish:undefined},{quote:'Too short'},{quote:'<b></b>'},{name:'<p></p>'},{website:'spam'}])assert.equal(testimonialSubmissionSchema.safeParse({...submission,...change}).success,false);
  const parsed=testimonialSubmissionSchema.parse({...submission,is_published:true,submitted_by_public:false});
  assert.equal(Object.hasOwn(parsed,'is_published'),false);
  assert.equal(Object.hasOwn(parsed,'submitted_by_public'),false);
});
test('portrait upload rejects SVG, forged MIME, invalid signatures and oversized files',()=>{
  const png=new Uint8Array([137,80,78,71,13,10,26,10,0]);
  const jpeg=new Uint8Array([255,216,255,224,0]);
  const webp=new TextEncoder().encode('RIFF0000WEBPVP8 0000');
  assert.equal(portraitExtension('image/png',png),'png');
  assert.equal(portraitExtension('image/jpeg',jpeg),'jpg');
  assert.equal(portraitExtension('image/webp',webp),'webp');
  assert.throws(()=>portraitExtension('image/svg+xml',new TextEncoder().encode('<svg/>')));
  assert.throws(()=>portraitExtension('image/jpeg',png));
  assert.throws(()=>portraitExtension('image/png',new TextEncoder().encode('<script>alert(1)</script>')));
  assert.throws(()=>portraitExtension('image/png',new Uint8Array(MAX_PORTRAIT_SIZE+1)));
});
test('private portrait lookup cannot point at a different testimonial or external image',()=>{
  const id='b8d8045c-40e0-49b9-86d9-101f708f97bd';
  assert.equal(testimonialPortraitPath(id,`/api/testimonial-portraits/${id}`),`portraits/${id}`);
  assert.equal(testimonialPortraitPath(id,'/api/testimonial-portraits/other'),null);
  assert.equal(testimonialPortraitPath(id,'https://example.com/image.jpg'),null);
});
