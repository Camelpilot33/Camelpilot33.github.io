let num=["NaN","false","null","true","undefined","Infinity",'0','1','2','3','4','5','6','7','8','9']
let res=["await",
"break",
"case",
"catch",
"class",
"const",
"continue",
"debugger",
"default",
"delete",
"do",
"else",
"export",
"extends",
"finally",
"for",
"function",
"if",
"import",
"in",
"instanceof",
"let",
"new",
"return",
"super",
"switch",
"this",
"throw",
"try",
"typeof",
"var",
"void",
"while",
"with",
"yield"]
res = res.concat([
    "int",
    "long",
    "short",
    "float",
    "double",
    "char",
    "unsigned",
    "signed",
    "void",
])
let op=['!','%','~','^','&','*','-','+','<','>','=','|',':','?']
let pun="()[]{},;.".split('')
function color(s) {
	if (!s) return ""
	let final=""
  let prev=''
  for (let a of s.match(/([A-Za-z]+|.)/g)) {
  	if (a=='\t') final+="&emsp;".repeat(3)
    else if (a==' ') final+=" "
    else if (num.includes(a)) final+="<span class='sh-num'>"+a+"</span>"
    else if (op.includes(a)) final+="<span class='sh-op'>"+a+"</span>"
    else if (res.includes(a)) final+="<span class='sh-res'>"+a+"</span>"
    else if (pun.includes(a)) final+="<span class='sh-pun'>"+a+"</span>"
    else if (a[0]==a[0].toUpperCase()) final+="<span class='sh-con'>"+a+"</span>"
    else if (prev=='.') final+="<span class='sh-att'>"+a+"</span>"
  	else {
    	final+="<span class='sh-var'>"+a+"</span>"
    }
    
    prev=a
  }
  return final
}

function highlight(txt) {
  lines=txt.replace(/    /g,'\t').split('\n')
  for (let l in lines) {
    [code,comment]=lines[l].split(/\/\/(.*)/)
    
    lines[l]=color(code)+(comment?("<span class='sh-com'>//"+comment+"</span>"):"")
    console.log(code)
  }
  
  return `<pre class="code">${lines.join('<br>')}</pre>`
  
}