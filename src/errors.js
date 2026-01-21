import {Loc} from './location.js';
import {SourceContext} from './source_context.js';

// PythonError类
export class PyError extends Error{
    /**
     * @param {string} type 错误类型名
     * @param {string} msg 错误消息
     * @param {Loc} loc 错误源代码位置
     * @param {PyError} cause 错误链
     * @param {string} sourceCode 源代码
     * @param {boolean} isRuntimeError 是否为运行时报错
     */
    constructor(type,msg,loc,scopeName='',cause=null,sourceCode='',isRuntimeError=true){
        super(msg);

        // JavaScript标准Error属性
        this.name='PyError';
        this._JsStack=super.stack;

        this.isRuntimeError=isRuntimeError;
        this.sourceManager=new SourceContext(sourceCode);

        // Python特有属性
        this.type=type;
        this.msg=msg;
        this.loc=loc;
        this.pythonic=true;  // PythonError标识
        this.cause=cause;  // 错误链
        this.scopeName=scopeName;  // 在哪个作用域里报错的
        this._PyStack=this._generateStack();  // Python风格调用栈

        // 冻结对象防止修改
        Object.freeze(this);
    }

    /**
     * 生成Python风格调用栈
     */
    _generateStack(){
        let stack=this._formatError();
    
        if(this.cause){
            stack+=`\nThe above exception was the direct cause of the following exception:\n\n`;
            stack+=this.cause._generateStack();
        }

        return stack;
    }

    /**
     * 生成单个错误的错误信息
     */
    _formatError(){
        let stack='';
        if(this.isRuntimeError){
            stack+='Traceback (most recent call last):\n';
            stack+=`  File "<stdin>", line ${this.loc.startLine}\n, in ${this.scopeName}`;
        }else{
            stack+=`  File "<stdin>", line ${this.loc.startLine}\n`;
        }
        stack+=`    ${this._getContext()}\n`
        stack+=`${this.type}: ${this.msg}\n`
        return stack;
    }

    /**
     * 获取错误的上下文
     */
    _getContext(){
        const errorLine=this.sourceManager.getLineContent(this.loc.startLine);
        
        // 只有当类型为SyntaxError时才需要箭头指向错误位置
        if(this.type==='SyntaxError'&&this.sourceManager.code){
            const arrowPos=this.loc.startCol;
            const spaces=' '.repeat(4+arrowPos);
            return `${errorLine}\n${spaces}^`;
        }

        return `    ${errorLine}`;
    }

    toString(){
        return this._PyStack;
    }

    /**
     * 调试：序列化
     */
    toJSON(){
        return {
            name:this.name,
            type:this.type,
            message:this.msg,
            location:this.loc,
            pythonic:this.pythonic,
            errno:this.errno
        };
    }
}
