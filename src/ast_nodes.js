import {Loc} from './location.js';
import {LiteralParser} from './literal_to_internal.js';

// AST节点基类
export class ASTNode{
    /**
     * @param {Loc} loc 位置信息
     */
    constructor(type,loc){
        this.type=type;
        this.loc=loc;
    }
}

// 程序类
export class Program extends ASTNode{
    constructor(loc=new Loc(0,0,0,0),body=[]){
        super('Program',loc);
        this.body=body;
    }

    toString(){
        return `Program(body=${this.body})`;
    }
}

// 表达式基类
export class Expression extends ASTNode{
    constructor(type,loc){
        super(type,loc);
    }
}

// 语句基类
export class Statement extends ASTNode{
    constructor(type,loc){
        super(type,loc);
    }
}

// 字面量
export class Literal extends Expression{
    constructor(loc,raw){
        super('Literal',loc);
        [this.value,this.isComplex]=LiteralParser.parse(raw);
        this.raw=raw;  // 原始值仅用于toString方法，无其他用处
    }

    toString(){
        if(this.isComplex){
            return `Literal(value=${this.value}j,raw=${this.raw},isComplex=${this.isComplex})`
        }
        return `Literal(value=${JSON.stringify(this.value)},raw=${JSON.stringify(this.raw)},isComplex=${this.isComplex})`
    }
}

// 标识符
export class Identifier extends Expression{
    constructor(loc,name){
        super('Identifier',loc);
        this.name=name;
    }

    toString(){
        return `Identifier(name=${this.name})`
    }
}

// 调用表达式
export class CallExpression extends Expression{
    constructor(loc,callee,args,keywords){
        super('CallExpression',loc);
        this.callee=callee;
        this.arguments=args;
        this.keywords=keywords;
    }

    toString(){
        return `CallExpression(callee=${this.callee},arguments=${this.arguments},keywords=${this.keywords})`
    }
}

// 块语句
export class BlockStatement extends Statement{
    constructor(loc,body=[],indentSize=4){
        super('BlockStatement',loc);
        this.body=body;
    }

    toString(){
        return `BlockStatement(body=${this.body})`;
    }
}

// 表达式语句
export class ExpressionStatement extends Statement{
    constructor(loc,expression){
        super('ExpressionStatement',loc);
        this.expression=expression;
    }

    toString(){
        return `ExpressionStatement(expression=${this.expression})`;
    }
}
