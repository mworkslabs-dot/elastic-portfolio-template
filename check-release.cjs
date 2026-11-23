const fs=require('node:fs'),assert=require('node:assert/strict');
for(const name of fs.readdirSync('.'))if(/\.(jpg|jpeg|png|webp|mp4)$/i.test(name))assert(['preview.png','demo.mp4'].includes(name),'Unexpected media in the template release: '+name);
for(const f of ['index.html','portfolio-content.js','portfolio.template.html'])assert(!/images\.squarespace-cdn|libfile_|2023FD82|assets\/existing|mailto:(?!hello@example\.com)/.test(fs.readFileSync(f,'utf8')),'Private portfolio material in '+f);
console.log('PASS: release contains only sample assets and contact details.');
