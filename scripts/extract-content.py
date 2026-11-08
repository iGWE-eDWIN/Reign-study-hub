"""Extract original HTML verbatim into the initial database seed. Run before editing legacy HTML."""
from html.parser import HTMLParser
from pathlib import Path
import re,json
class Node:
 def __init__(self,tag='',attrs=None): self.tag=tag;self.attrs=dict(attrs or []);self.children=[]
 def text(self): return ' '.join(c.text() if isinstance(c,Node) else c for c in self.children).strip()
 def find(self,tag=None,cls=None):
  out=[]
  for c in self.children:
   if isinstance(c,Node):
    if (not tag or c.tag==tag) and (not cls or cls in c.attrs.get('class','').split()): out.append(c)
    out+=c.find(tag,cls)
  return out
class Parser(HTMLParser):
 def __init__(self): super().__init__();self.root=Node();self.stack=[self.root]
 def handle_starttag(self,tag,attrs):
  n=Node(tag,attrs);self.stack[-1].children.append(n)
  if tag not in ('img','input','meta','link','br','hr'): self.stack.append(n)
 def handle_endtag(self,tag):
  for i in range(len(self.stack)-1,0,-1):
   if self.stack[i].tag==tag: self.stack=self.stack[:i];break
 def handle_data(self,d):
  if d.strip(): self.stack[-1].children.append(d.strip())
p=Parser();p.feed(Path('index.html').read_text());r=p.root
slug=lambda s:re.sub(r'[^a-z0-9]+','-',s.lower()).strip('-')
def paras(n): return '\n\n'.join(x.text() for x in n.find('p'))
services=[{'slug':slug(n.find('h3')[0].text()),'title':n.find('h3')[0].text(),'short_description':paras(n),'content':paras(n),'image_url':'','is_published':True,'sort_order':i} for i,n in enumerate(r.find(cls='svc-card'))]
# Verified real European university photographs, with attribution metadata.
service_images=json.loads(Path('lib/service-photography.json').read_text())
for service in services:
 service['image_url']=service_images[service['slug']]['image_url']
sel={n.attrs['name']:n for n in r.find('select')}
dest=[]
for opt in sel['destination'].find('option'):
 if opt.attrs.get('value')=='':continue
 name=opt.text();dest.append({'name':name,'flag_emoji':'','is_active':True,'sort_order':len(dest),'image_url':'','description':'','requirements':[]})
for card in r.find(cls='dest-card'):
 name=card.find('h3')[0].text();name='United States of America' if name=='USA' else name
 entry=next((d for d in dest if d['name']==name),None)
 if entry:
  entry['flag_emoji']=card.find(cls='flag')[0].text();entry['description']=card.find('p')[0].text()
  photo=card.find(cls='dest-photo')[0].attrs.get('style','');m=re.search(r"url\('([^']+)'\)",photo)
  entry['image_url']=m.group(1) if m and name!='United States of America' else ''
for panel in r.find(cls='req-panel'):
 names={'req-canada':['Canada'],'req-uk':['United Kingdom'],'req-spain':['Spain'],'req-turkey':['Turkey'],'req-poland':['Poland'],'req-cyprus':['Cyprus','North Cyprus']}[panel.attrs['id']]
 for d in dest:
  if d['name'] in names:d['requirements']=[n.text() for n in panel.find('li')]
about=r.find(cls='about-text')[0]
vm={n.find('h4')[0].text():n.find('p')[0].text() for n in r.find(cls='vm-card')}
founder=r.find(cls='founder-banner')[0]
settings={'id':1,'site_name':'REIGN STUDY HUB LTD','tagline':'Your Global Education Partner','parent_company':"A subsidiary of PIS INT'L SYNERGY LTD",'logo_url':'/assets/logo-header.png','email':'reignstudyabroad@gmail.com','whatsapp_number':'2348034239813','phone_numbers':['+234 803 423 9813','+44 7480 251588'],'addresses':[{'label':n.find('h4')[0].text(),'address':n.find('p')[0].text()} for n in r.find(cls='office')[:3]],'working_hours':'','social_links':{},'stats':[],'about_text':paras(about),'vision_text':vm['Our Vision'],'mission_text':vm['Our Mission'],'values_text':vm['Our Values'],'processing_fee':'','map_embed_url':'','privacy_text':'','application_process':[{'title':n.find('h3')[0].text(),'description':n.find('p')[0].text()} for n in r.find(cls='proc-card')],'document_checklists':[]}
hero=r.find(cls='hero')[0]
slides=[{'tagline':'Your Global Education Partner','headline':hero.find('h1')[0].text(),'subtext':hero.find('p')[0].text(),'image_url':'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1800&q=85','cta_label':'Apply Now','cta_link':'/apply','sort_order':i,'is_active':True} for i in range(3)]
# Additional slides reuse existing copy; no new claims.
slides[1].update(headline='Empowering Your Global Education Journey',subtext=services[0]['short_description'],cta_label='Explore Destinations',cta_link='/destinations',image_url='https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&q=85')
slides[2].update(headline='Ready to Start Your Journey?',subtext='Get expert guidance and begin your application today.',cta_label='Book Appointment',cta_link='/book-appointment')
# Three distinct photographs already used by the original site. The former hero URL returns 404.
for slide, photo in zip(slides, ['photo-1523240795612-9a054b0db644', 'photo-1513635269975-59663e0ac1ad', 'photo-1517935706615-2717063c694e']):
 slide['image_url']=f'https://images.unsplash.com/{photo}?w=1600&q=80&auto=format&fit=crop'
# The third slide uses the commissioned Reign atlas artwork.
slides[2]['image_url']='/assets/hero-atlas-vintage.png'
destination_photos=json.loads(Path('lib/destination-photography.json').read_text())
for destination in dest:
 if destination['name'] in destination_photos:destination['image_url']=destination_photos[destination['name']]['image_url']
seed={'site_settings':settings,'services':services,'destinations':dest,'slides':slides,'team_members':[{'name':'Osepribo T.S. Jackrich','role':'Founder / CEO','bio':founder.find('p')[0].text(),'image_url':'/assets/founder.jpg','sort_order':0,'is_published':True}],'programme_levels':[{'name':n.text(),'is_active':True,'sort_order':i} for i,n in enumerate(sel['level'].find('option')) if n.attrs.get('value')!=''],'appointment_service_types':[{'name':s['title'],'is_active':True,'sort_order':i} for i,s in enumerate(services)],'course_options':[n.text() for n in sel['course'].find('option') if n.attrs.get('value')!=''],'intakes':[n.text() for n in sel['intake'].find('option')],'budgets':[n.text() for n in sel['budget'].find('option')]}
seed['programme_levels'].insert(0,{'name':'Vocational/Diploma','is_active':True,'sort_order':-1})
Path('lib/seed-content.json').write_text(json.dumps(seed,indent=2,ensure_ascii=False)+'\n')
print('Extracted original services, destinations, requirements, settings, founder, forms and process.')
