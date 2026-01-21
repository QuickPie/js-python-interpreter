import {Interpreter} from './interpreter.js';

export class Builtins{
    /**
     * 注册所有内置函数至全局作用域
     * @param {Interpreter} interpreter 目标解释器
     */
    static setupAll(interpreter){
        const builtins={
            'print':this.createPrint(interpreter),
        }

        for(const [name,func] of Object.entries(builtins)){
            interpreter.environment.set(name,func);
        }
    }

    static createPrint(interpreter){
        return (args,kwargs)=>{
            const sep=kwargs.sep||' ';
            const end=kwargs.end||'\n';

            const output=args.map(arg=>this.restore(arg)).join(sep)+end;
            interpreter.output.push(output);
            return undefined;
        }
    }

    // TODO: 定义create系列函数

    /**
     * 将内部值恢复为Python值字符串
     */
    static restore(value){
        if(value===null||value===undefined){
            return 'None';
        }
        if(typeof value==='boolean'){
            return value?'True':'False';
        }
        return value;
    }
}