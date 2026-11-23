const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const c=require('./portfolio-content.js'),html=fs.readFileSync('index.html','utf8');
assert.equal(c.identity.nameLines.length,2);assert(c.categories.length>0);
for(const s of html.matchAll(/<script>([\s\S]*?)<\/script>/g))new vm.Script(s[1]);
for(const cat of c.categories)for(const p of cat.projects){assert(p.approved);for(const im of p.images){assert.equal(im.permission,'approved');assert(im.alt);assert(fs.existsSync(im.src),im.src);}}
for(const im of [c.about.portrait,c.about.head])assert(fs.existsSync(im.src));
assert(html.includes("gallery.scrollIntoView({behavior:'instant'});revealProject();"));assert(html.includes('prefers-reduced-motion'));assert(html.includes('nameLines.map'));
console.log('PASS: scripts parse; content and assets resolve; reduced motion and project reveal fix retained.');
