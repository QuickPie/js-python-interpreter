import {Interpreter} from './interpreter.js';
import {HashManager} from './hash_manager.js';

/**
 * 目标解释器
 * @type {Interpreter}
 */
let interpreter;

/**
 * 实现外部修改 interpreter
 */
export function setInterpreter(i){
    interpreter=i;
}

export class Builtins{
    /**
     * 注册所有内置函数至全局作用域
     */
    static setupAll(){
        const builtins={
            'abs':this.createAbs(),
            'all':this.createAll(),
            'print':this.createPrint(),
        }

        for(const [name,func] of Object.entries(builtins)){
            func.__is_builtin=true;
            interpreter.environment.set(name,func);
        }
    }

    // ---------- 工具方法 ----------

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

    /**
     * 获取内部值的Python类型
     */
    static getType(value){
        if(value===null||value===undefined){
            return 'NoneType';
        }
        if(typeof value==='boolean'){
            return 'bool';
        }
        if(typeof value==='number'){
            return Number.isInteger(value)?'int':'float';
        }
        if(typeof value==='string'){
            return 'str';
        }
        if(typeof value==='function'){
            if(value.__is_builtin)return 'builtin_function_or_method';
            return 'function';
        }
        if(typeof value==='object'){
            
        }
    }

    // ---------- 内置函数（按照字母顺序） ----------

    // TODO: 定义create系列函数

    static createAbs(){
        /**
         * args 是位置参数，kwargs 是关键字参数，loc 是存储位置的参数。
         * loc 是特意加的，便于报错。
         */
        return (args,kwargs,loc)=>{
            if(Object.keys(kwargs).length){
                interpreter.raiseError('TypeError','abs() takes no keyword arguments',loc);
            }

            if(args.length!==1){
                interpreter.raiseError('TypeError',`abs() takes exactly one argument (${args.length} given)`,loc);
            }

            const num=args[0];
            if(typeof num!=='number'){
                interpreter.raiseError('TypeError',`bad operand type for abs(): '${this.getType(num)}'`,loc);
            }

            return Math.abs(num);
        }
    }

    static createAll(){
        return (args,kwargs,loc)=>{
            if(Object.keys(kwargs).length){
                interpreter.raiseError('TypeError','all() takes no keyword arguments',loc);
            }

            if(args.length!==1){
                interpreter.raiseError('TypeError',`all() takes exactly one argument (${args.length} given)`,loc);
            }

            const iterable=args[0];
            if(iterable==null||typeof iterable[Symbol.iterator]!=='function'){
                interpreter.raiseError('TypeError',`'${this.getType(iterable)}' object is not iterable`,loc);
            }

            for(const item of iterable){
                if(!item)return false;
            }
            return true;
        }
    }

    static createAny(){
        return (args,kwargs,loc)=>{
            if(Object.keys(kwargs).length){
                interpreter.raiseError('TypeError','any() takes no keyword arguments',loc);
            }

            if(args.length!==1){
                interpreter.raiseError('TypeError',`any() takes exactly one argument (${args.length} given)`,loc);
            }

            const iterable=args[0];
            if(i==null||typeof obj[Symbol.iterator]!=='function'){
                interpreter.raiseError('TypeError',`'${this.getType(iterable)}' object is not iterable`,loc);
            }

            for(const item of iterable){
                if(item)return true;
            }
            return false;
        }
    }

    static createPrint(){
        return (args,kwargs,loc)=>{
            let sep=' ';
            let end='\n';

            for(const [name,value] of Object.entries(kwargs)){
                if(name==='sep'){
                    if(typeof value!=='string'){
                        interpreter.raiseError('TypeError',`${name} must be None or a string, not ${this.getType(value)}`,loc);
                    }
                    sep=value;
                }else if(name==='end'){
                    if(typeof value!=='string'){
                        interpreter.raiseError('TypeError',`${name} must be None or a string, not ${this.getType(value)}`,loc);
                    }
                    end=value;
                }else{
                    interpreter.raiseError('TypeError',`'${name}' is an invalid keyword argument for print()`,loc);
                }
            }

            const output=args.map(arg=>this.restore(arg)).join(sep)+end;
            interpreter.output.push(output);
            return undefined;
        }
    }
}

// ---------- 内置类型 ----------

export class PyList{
    constructor(elements){
        this.elements=elements;
    }

    *[Symbol.iterator](){
        for(const item of this.elements)yield item;
    }
}

export class PyTuple{
    constructor(elements){
        this.elements=elements;
    }

    *[Symbol.iterator](){
        for(const item of this.elements)yield item;
    }
}

export class PyDict{
    constructor(keys,values){
        this.keys=keys;
        this.values=values;
    }

    *[Symbol.iterator](){
        for(const item of this.keys)yield item;
    }
}

export class PySet{
    constructor(elements){
        this.elements=elements.sort((a,b)=>{
            return Math.random()-Math.random();
        });
    }

    *[Symbol.iterator](){
        for(const item of this.elements)yield item;
    }
}
