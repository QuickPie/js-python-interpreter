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
        this.raw=raw;
    }

    toString(){
        if(this.isComplex){
            return `Literal(value=${this.value}j,raw=${this.raw},isComplex=${this.isComplex})`
        }
        return `Literal(value=${JSON.stringify(this.value)},raw=${JSON.stringify(this.raw)},isComplex=${this.isComplex})`
    }
}

// 空语句
export class EmptyStatement extends Statement{
    constructor(loc){
        super('EmptyStatement',loc);
    }

    toString(){
        return 'EmptyStatement()';
    }
}

// 块语句
export class BlockStatement extends Statement{
    constructor(loc,body=[],indentSize=4){
        super('BlockStatement',loc);
        this.body=body;
        this.indentSize=indentSize;  // 块的缩进级别（用于报错）
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
