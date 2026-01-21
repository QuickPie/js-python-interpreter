import {lexer} from './src/lexer.js';
import {Parser} from './src/parser.js';
import {Interpreter} from './src/interpreter.js';
import {Program} from './src/ast_nodes.js';
import {PyError} from './src/errors.js';

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded',()=>{
    // 初始化编辑器
    const editor=CodeMirror.fromTextArea(document.getElementById("code-input"),{
        mode:"python",
        lineNumbers:true,
        indentUnit:4
    });

    // 获取按钮
    const runBtn=document.getElementById('run-btn');
    const closeBtn=document.getElementById('close-btn');

    // 运行按钮点击事件
    runBtn.addEventListener('click',()=>{
        const code=editor.getValue();
        const outputArea=document.getElementById("output-area");
        const outputDiv=document.getElementById("output");

        outputArea.classList.add("visible");

        // 调用词法分析器
        const tokens=lexer(code);

        let html='<b>词法分析结果：</b>';

        // 显示token表格
        html+='<table style="width:100%; border-collapse:collapse; margin-top:10px;">';
        html+='<tr style="background: #f0f0f0; font-weight:bold;">';
        html+='<th style="border:1px solid #ddd; padding:8px;">类型</th>';
        html+='<th style="border:1px solid #ddd; padding:8px;">值</th>';
        html+='<th style="border:1px solid #ddd; padding:8px;">位置</th>';
        html+='</tr>';

        tokens.forEach((token)=>{
            html+=`<tr style="background: #fff;">`;
            html+=`<td style="border:1px solid #ddd; padding:8px; color: #333; font-weight:bold;">${token.type}</td>`;
            html+=`<td style="border:1px solid #ddd; padding:8px; font-family:monospace;">${escapeHtml(token.value)}</td>`;
            html+=`<td style="border:1px solid #ddd; padding:8px; font-size:12px; color:#666;">${token.loc.toString()}</td>`;
            html+='</tr>';
        })

        html+='</table>';
        outputDiv.innerHTML=code+'<br>'+html+'<br>';

        // 调用语法分析器
        const parser=new Parser(tokens,code)
        const ast=parser.parse();

        // 显示语法分析结果
        html+='<br>';

        if(ast instanceof PyError){
            console.log(ast,ast._PyStack);
            html+=`<b>解析失败！</b>`;
            html+=`<code><pre style="font-family:Monaco,monospace; margin:5px 0">${escapePreHtml(ast.toString())}</pre></code>`;
            outputDiv.innerHTML=html+'<br>';
            return;
        }
        
        html+=`<b>解析成功！</b>`;
        html+=`<pre>${JSON.stringify(ast,null,2)}</pre>`;
        
        outputDiv.innerHTML=html+'<br>';

        // 调用解释器
        const interpreter=new Interpreter(code);
        const output=interpreter.interpret(ast);

        // 显示输出
        html+='<br>';

        if(output instanceof PyError){
            console.log(output,output._PyStack)
            html+=`<b>运行时错误！</b>`;
            html+=`<code><pre style="font-family:Monaco,monospace; margin:5px 0">${escapePreHtml(output.toString())}</pre></code>`;
            outputDiv.innerHTML=html+'<br>';
            return;
        }

        html+=`<b>运行成功！</b>`;
        html+=`<pre>${output}</pre>`;

        outputDiv.innerHTML=html+'<br>';
    });

    // 关闭按钮点击事件
    closeBtn.addEventListener('click',()=>{
        document.getElementById("output-area").classList.remove("visible");
    });
});

// 绑定按下 Ctrl + Enter 键盘事件到运行代码按钮
document.addEventListener('keydown',(event)=>{
    if(event.ctrlKey&&event.key==='Enter'){
        document.getElementById('run-btn').click();
    }
})

// 辅助函数：转义HTML特殊字符
function escapeHtml(text){
    if(text===null||text===undefined)return '';
    return text.toString()
        .replace(/&/g,'&amp;')
        .replace(/</g,'&lt;')
        .replace(/>/g,'&gt;')
        .replace(/"/g,'&quot;')
        .replace(/'/g,'&#039;')
        .replace(/\n/g,'⏎')
        .replace(/\t/g,'→')
        .replace(/ /g,'·');
}

// 辅助函数：转义<pre>标签中的HTML特殊字符
function escapePreHtml(text){
    if(text===null||text===undefined)return '';
    return text
        .replace(/&/g,'&amp;')
        .replace(/</g,'&lt;')
        .replace(/>/g,'&gt;')
        .replace(/"/g,'&quot;')
        .replace(/'/g,'&#039;');
}
