import {Loc} from './location.js';
import {PyError} from './errors.js';
import {
    TokenType,Token,
    literalSet
} from './token.js';
import {
    Program,
    Expression,
    Statement,
    Literal,
    EmptyStatement,
    ExpressionStatement
} from './ast_nodes.js';

export class Parser{
    /**
     * @param {Token[]} tokens
     */
    constructor(tokens,sourceCode){
        this.code=sourceCode;
        this.tokens=tokens;
        this.pos=0;

        // 缩进状态
        this.indentStack=[0];  // 缩进栈
        this.currentIndent=0;  // 当前缩进级别
        this.blockStack=[];  // 块栈，存储块类型信息

        // 块解析状态
        this.expectingBlock=false;  // 是否期待一个块（冒号后）
        this.blockType=null;  // 当前块的类型（'if', 'while'等）
        this.blockStartLine=-1;  // 块开始的行号
        this.inSingleLineBlock=false;  // 是否在单行块中
        this.singleLineBlockEnded=false;  // 单行块是否已结束
    }

    /**
     * 便捷语法报错方法
     * @param {string} type 错误类型 默认值为 'SyntaxError'
     * @param {string} msg 错误信息 默认值为 'invalid syntax'
     * @param {Loc} loc 错误位置 默认值为 this.peek().loc
     * @param {PyError} cause 错误链 默认值为 null
     * @param {boolean} isRuntimeError 是否为运行时错误（解释时错误） 默认值为 false
     * 
     * 若当前token为TokenType.ERROR，则`[type,msg]=this.peek().value.split(': ',2);`
     */
    raiseError(type='SyntaxError',msg='invalid syntax',loc=this.peek().loc,cause=null,code=this.code,isRuntimeError=false){
        if(this.check(0,TokenType.ERROR)){
            [type,msg]=this.peek().value.split(': ',2);
        }
        throw new PyError(type,msg,loc,cause,code,isRuntimeError);
    }

    // ========== 核心工具方法 ==========

    /**
     * 检查是否到达末尾
     */
    isAtEnd(){
        return this.peek().type===TokenType.EOF;
    }

    /**
     * 查看当前token
     * @returns {Token}
     */
    peek(){
        return this.tokens[this.pos];
    }

    /**
     * 查看前一个token
     * @returns {Token}
     */
    previous(){
        return this.tokens[this.pos-1];
    }

    /**
     * 检查向后偏移`offset`位的token类型是否匹配
     */
    check(offset=0,...types){
        if(this.pos+offset>=this.tokens.length)return false;
        const targetToken=this.tokens[this.pos+offset];        

        if(types.length===1&&typeof types[0]==='object'&&!(types[0] instanceof String)&&
            this._isIterable(types[0])&&!this._isType(types[0])){
            const expected=types[0];
            return this._isValueInCollection(targetToken.type,expected);
        }else{
            for(const type of types){
                if(targetToken.type===type)return true;
            }
            return false;
        }
    }

    /**
     * 检查值是否在集合中
     */
    _isValueInCollection(value,collection){
        // 1.如果是Set，使用has()方法
        if(collection instanceof Set){
            return collection.has(value);
        }

        // 2.如果是数组或类数组，使用includes()或indexOf()
        if(Array.isArray(collection)||
            typeof collection==='object'&&'length' in collection){
            return collection.includes
                  ?collection.includes(value)
                  :Array.prototype.indexOf.call(collection,value)!==-1;
        }

        // 3.如果是普通对象，使用in运算符
        if(typeof collection==='object'&&collection!==null){
            return value in collection;
        }

        // 4.其他可迭代对象
        try{
            for(const item of collection){
                if(item===value){
                    return true;
                }
            }
            return false;
        }catch{
            return false;
        }
    }

    /**
     * 检查对象是否可迭代（即是否具有`Symbol.iterator`属性）
     */
    _isIterable(obj){
        return obj!=null&&typeof obj[Symbol.iterator]==='function';
    }

    /**
     * 检查对象是否为类型
     * 
     * JavaScript中，所有类型通常都是通过函数实现的，它们本质上是函数。
     * 但类型和函数的区别是，类型有`prototype`属性，而函数没有。
     */
    _isType(obj){
        return obj!=null&&typeof obj==='function'&&obj.prototype!==undefined;
    }

    /**
     * 前进并返回前一个token
     * @returns {Token}
     */
    advance(){
        const token=this.peek()
        if(!this.isAtEnd())this.pos++;
        return token;
    }

    /**
     * 如果匹配则前进
     */
    match(...types){
        if(this.check(0,types)){
            this.advance();
            return true;
        }
        return false;
    }

    /**
     * 期望并消费当前token，匹配失败则报错
     */
    consume(...types){
        if(this.check(0,types))return this.advance();
        this.raiseError();
    }

    // ========== 处理缩进核心方法 ==========

    /**
     * 处理缩进：进入/退出块
     */
    handleIndentation(){
        // 处理错误token
        if(this.check(0,TokenType.ERROR)){
            this.raiseError();
        }
        
        // 处理INDENT
        if(this.match(TokenType.INDENT)){
            const indentToken=this.previous();
            const newIndent=indentToken.value;  // INDENT token的value属性存储该缩进级别

            // 检查是否在期待块
            if(this.expectingBlock){
                // 检查缩进是否是增加的
                if(newIndent<=this.currentIndent){
                    this.raiseError('IndentationError','expected an indented block',indentToken.loc);
                }

                // 进入多行块
                this.enterBlock(newIndent,'multiline');
                return {type:'enter_multiline_block',indent:newIndent};
            }else{
                // 嵌套块
                this.enterBlock(newIndent,'nested');
                return {type:'enter_nested_block',indent:newIndent};
            }
        }

        // 处理DEDENT
        if(this.match(TokenType.DEDENT)){
            const dedentToken=this.previous();
            const newIndent=dedentToken.value;  // DEDENT token的value属性存储该缩进级别

            // 检查缩进是否合理
            if(newIndent>=this.currentIndent){
                this.raiseError('IndentationError','unexpected dedent',dedentToken.loc);
            }

            // 退出块
            const exitedBlock=this.exitBlock(newIndent);
            return {
                type:'exit_block',
                indent:newIndent,
                blockType:exitedBlock?.type
            };
        }

        return null;
    }

    /**
     * 进入块
     * @param {string} blockMode 块的模式 如`'multiline'`（多行块）、`'singleline'`（单行块）、`'nested'`（嵌套块）
     */
    enterBlock(indentLevel,blockMode){
        this.indentStack.push(indentLevel);
        this.currentIndent=indentLevel;

        this.blockStack.push({
            type:this.blockType||'generic',
            mode:blockMode,
            startLine:this.blockStartLine,
            indent:indentLevel
        });

        if(this.expectingBlock){
            this.expectingBlock=false;
        }

        console.log(`进入块: mode=${blockMode}, indent=${indentLevel}, type=${this.blockType}`)
    }

    /**
     * 退出块
     */
    exitBlock(newIndent){
        if(this.indentStack.length<=1){
            this.raiseError('IndentationError','unexpected dedent');
        }

        const exitedBlock=this.blockStack.pop();
        this.indentStack.pop();
        this.currentIndent=this.indentStack[this.indentStack.length-1];

        // 如果退出的是多行块，重置块类型
        if(exitedBlock?.mode==='multiline'){
            this.blockType=null;
            this.blockStartLine=-1;
        }

        console.log(`退出块: type=${exitedBlock?.type}, 回到缩进=${this.currentIndent}`);
        return exitedBlock;
    }

    // ========== 解析方法 ==========

    /**
     * 解析程序（主入口）
     */
    parse(){
        const ast=[];

        try{
            while(!this.isAtEnd()){
                // 处理缩进
                // 1.处理缩进变化
                const indentChange=this.handleIndentation();
                if(indentChange){
                    if(indentChange.type==='enter_multiline_block'){
                        // 开始解析多行块
                        const block=this.parseMultilineBlock();
                        ast.push(block);
                    }
                    continue;
                }

                // TODO

                // 解析语句
                const stmt=this.parseStatement();
                if(stmt)ast.push(stmt);

                // 处理行尾分号
                let foundSemicolon=false;
                while(this.check(0,TokenType.SEMICOLON)){
                    foundSemicolon=true;
                    const curr=this.advance();
                    ast.push(new EmptyStatement(curr.loc));
                }

                // 处理行尾换行
                if(!foundSemicolon){
                    this.consume(TokenType.NEWLINE,TokenType.EOF);
                }
            }
        }catch(error){
            // 如果是PythonError则返回错误，否则直接崩溃
            if(error.pythonic){
                return error;
            }else{
                throw error;
            }
        }

        return new Program(new Loc(1,0,this.peek().loc.endLine,this.peek().loc.endCol),ast);
    }

    /**
     * 解析多行块（缩进块）
     */
    parseMultilineBlock(){
        const startLoc=this.peek().loc;
        const blockIndent=this.currentIndent;
        const body=[];

        console.log(`解析多行块，起始缩进: ${blockIndent}`);

        while(!this.isAtEnd()){
            // 检查是否应该结束当前块
            if(this.check(0,TokenType.DEDENT)){
                const dedentToken=this.tokens[this.pos];
                const nextIndent=dedentToken.value;

                if(nextIndent<blockIndent){
                    console.log(`遇到DEDENT(${nextIndent})，结束块`);
                    break;
                }
            }

            // 处理块内的缩进变化（嵌套块）
            const indentChange=this.handleIndentation();
            if(indentChange?.type==='enter_nested_block'){
                // 嵌套块
                const nestedBlock=this.parseMultilineBlock();
                body.push(nestedBlock);
                continue;
            }else if(indentChange?.type==='exit_block'){
                // 如果退出的是当前块，结束
                if(indentChange.indent<blockIndent){
                    break;
                }
                continue;
            }

            // 跳过空行
            if(this.match(TokenType.NEWLINE))continue;

            // TODO: 解析语句
        }
    }

    /**
     * 解析语句
     */
    parseStatement(){
        if(this.check(0,TokenType.SEMICOLON)){
            return new EmptyStatement(this.advance().loc);
        }
        return this.parseExpressionStatement();
    }

    /**
     * 解析表达式语句
     */
    parseExpressionStatement(){
        const loc=this.peek().loc;
        const expression=this.parseExpression();
        return new ExpressionStatement(loc,expression);
    }

    /**
     * 解析表达式
     */
    parseExpression(){
        if(this.check(0,literalSet)){
            return this.parsePrimary();
        }
        this.raiseError();
    }

    /**
     * 解析基本元素
     */
    parsePrimary(){
        if(this.check(0,literalSet)){
            const token=this.advance();
            return new Literal(token.loc,token.value);
        }
        this.raiseError();
    }
}

