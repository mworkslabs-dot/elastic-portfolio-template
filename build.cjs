const fs=require('node:fs'),path=require('node:path');
const content=require('./portfolio-content.js');
if(!Array.isArray(content.identity.nameLines)||content.identity.nameLines.length!==2||content.identity.nameLines.some(s=>!s.trim()))throw Error('Use two non-empty nameLines.');
const escape=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let html=fs.readFileSync('portfolio.template.html','utf8');
html=html.replace('<!-- PAGE_TITLE -->',escape(content.identity.title)).replace('<!-- PAGE_DESCRIPTION -->',escape(content.identity.description));
for(const [marker,file] of [['SOFT_LETTERS_ENGINE','soft-letters.js'],['PORTFOLIO_CONTENT','portfolio-content.js']])html=html.replace('<!-- '+marker+' -->','<script>\n'+fs.readFileSync(''+file,'utf8').replace(/<\/script/gi,'<\\/script')+'\n</script>');
fs.writeFileSync('index.html',html);
console.log('Built index.html.');
