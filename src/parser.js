import {Loc} from './location.js';
import {PyError} from './errors.js';
import {
    TokenType,Token,
    literalSet,terminatorSet
} from './token.js';
import {
    Program,
    Expression,
    Statement,
    Literal,
    Identifier,
    ListLiteral,
    TupleLiteral,
    DictLiteral,
    SetLiteral,
    CallExpression,
    ExpressionStatement,
    BlockStatement
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
    raiseError(type='SyntaxError',msg='invalid syntax',loc=this.peek().loc,cause=null){
        if(this.check(0,TokenType.ERROR)){
            [type,msg]=this.peek().value.split(': ',2);
        }
        throw new PyError(type,msg,loc,'',cause,this.code,false);
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
            this.#isIterable(types[0])&&!this.#isType(types[0])){
            const expected=types[0];
            return this.#isValueInCollection(targetToken.type,expected);
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
    #isValueInCollection(value,collection){
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
    #isIterable(obj){
        return obj!=null&&typeof obj[Symbol.iterator]==='function';
    }

    /**
     * 检查对象是否为类型
     * 
     * JavaScript中，所有类型通常都是通过函数实现的，它们本质上是函数。
     * 但类型和函数的区别是，类型有`prototype`属性，而函数没有。
     */
    #isType(obj){
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
     * 处理冒号：开始期待一个块
     */
    handleColon(){
        const colonToken=this.previous();

        this.expectingBlock=true;
        this.blockStartLine=colonToken.loc.startLine;
        this.inSingleLineBlock=false;
        this.singleLineBlockEnded=false;

        console.log(`冒号 at line ${this.blockStartLine}`);
    }

    /**
     * 处理换行：检查块类型（单行/多行）
     */
    handleNewline(){
        const newlineToken=this.previous();

        // 如果在期待块，且遇到换行，说明是多行块
        if(this.expectingBlock&&!this.inSingleLineBlock){
            console.log(`换行 at line ${newlineToken.loc.startLine}, 开始多行块`);

            // 接下来必须遇到INDENT
            if(!this.check(0,TokenType.INDENT)){
                this.raiseError('IndentationError','expected an indented block',newlineToken.loc)
            }
        }

        // 如果已经在单行块中遇到换行，错误
        if(this.inSingleLineBlock&&!this.singleLineBlockEnded){
            this.raiseError('IndentationError','unexpected indent',newlineToken.loc);
        }
    }

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
            const exitedBlock=this.exitBlock();
            return {
                type:'exit_block',
                indent:newIndent,
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
            mode:blockMode,
            startLine:this.blockStartLine,
            indent:indentLevel
        });

        if(this.expectingBlock){
            this.expectingBlock=false;
        }

        console.log(`进入块: mode=${blockMode}, indent=${indentLevel}`)
    }

    /**
     * 退出块
     */
    exitBlock(){
        if(this.indentStack.length<=1){
            this.raiseError('IndentationError','unexpected dedent');
        }

        const exitedBlock=this.blockStack.pop();
        this.indentStack.pop();
        this.currentIndent=this.indentStack[this.indentStack.length-1];

        // 如果退出的是多行块，重置块
        if(exitedBlock?.mode==='multiline'){
            this.blockStartLine=-1;
        }

        console.log(`退出块: 回到缩进=${this.currentIndent}`);
        return exitedBlock;
    }

    /**
     * 检查并开始单行块
     */
    checkAndStartSingleLineBlock(){
        // 如果在冒号后，且下一个token不是NEWLINE，则是单行块
        if(this.expectingBlock&&!this.check(0,TokenType.NEWLINE)){
            console.log('开始单行块');
            this.inSingleLineBlock=true;
            this.enterBlock(this.currentIndent,'singleline');
            return true;
        }
        return false;
    }

    /**
     * 结束单行块
     */
    endSingleLineBlock(){
        if(this.inSingleLineBlock){
            console.log('结束单行块');
            this.inSingleLineBlock=false;
            this.singleLineBlockEnded=true;
            this.expectingBlock=false;
            this.blockStartLine=-1;

            // 从块栈中弹出单行块
            if(this.blockStack.length>0&&
                this.blockStack[this.blockStack.length-1].mode==='singleline'){
                this.blockStack.pop();
            }
        }
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

                // 2.处理冒号（开始期待块）
                if(this.match(TokenType.COLON)){
                    this.handleColon();
                    continue;
                }

                // 3.处理换行
                if(this.match(TokenType.NEWLINE)){
                    this.handleNewline();

                    // 如果单行块已结束，重置状态
                    if(this.singleLineBlockEnded){
                        this.endSingleLineBlock();
                    }
                    continue;
                }

                // 4.检查是否开始单行块
                if(this.expectingBlock&&!this.inSingleLineBlock){
                    if(this.checkAndStartSingleLineBlock()){
                        // 单行块内的语句
                        const stmt=this.parseStatement();
                        if(stmt)ast.push(stmt);
                        continue;
                    }
                }

                // 6.解析普通语句
                const stmt=this.parseStatement();
                if(stmt){
                    ast.push(stmt);

                    // 如果在单行块中，检查语句间的分号
                    if(this.inSingleLineBlock&&this.match(TokenType.SEMICOLON)){
                        continue;
                    }else if(this.inSingleLineBlock){
                        // 单行块结束
                        this.endSingleLineBlock();
                    }
                }

                // 7.检查语句后的token
                this.checkPostStatement();
            }

            // 文件结束时验证所有块都结束
            this.validateEndOfFile();
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
     * 检查语句后的token是否合法
     */
    checkPostStatement(){
        const validAfterStatement=new Set([
            TokenType.NEWLINE,
            TokenType.EOF,
            TokenType.SEMICOLON,
            TokenType.DEDENT,
        ]);

        if(!this.isAtEnd()&&!validAfterStatement.has(this.peek().type)){
            // 单行块内允许连续语句（用空表达式（分号）分隔）
            if(!this.inSingleLineBlock){
                this.raiseError();
            }
        }

        this.advance();
    }

    /**
     * 文件结束时验证
     */
    validateEndOfFile(){
        if(this.expectingBlock||this.currentIndent!==0){
            this.raiseError('SyntaxError','unexpected EOF while parsing',this.peek().loc)
        }
    }

    /**
     * 解析多行块（缩进块）
     */
    parseMultilineBlock(){
        const loc=this.peek().loc;
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

            // 解析语句
            const stmt=this.parseStatement();
            if(stmt)body.push(stmt);
        }

        const block=new BlockStatement(loc,body);
        console.log(`多行块结束，语句数: ${body.length}`);
        
        return block;
    }

    /**
     * 解析语句
     */
    parseStatement(){
        if(this.check(0,TokenType.SEMICOLON)){
            this.raiseError();
        }
        return this.parseExpressionStatement();
    }

    /**
     * 解析表达式语句
     */
    parseExpressionStatement(){
        const loc=this.peek().loc;
        const expression=this.parseExpressionWithTuple();
        return new ExpressionStatement(loc,expression);
    }

    /**
     * 解析表达式，支持元组形式并可能解析为元组
     */
    parseExpressionWithTuple(){
        const first=this.parseExpression();

        // 检查逗号
        if(this.match(TokenType.COMMA)){
            // 解析元组剩余部分
            return this.parseTupleLiteralRest(first);
        }

        return first;
    }

    /**
     * 解析表达式
     */
    parseExpression(){
        if(this.check(0,TokenType.LSQB)){
            return this.parseListLiteral();
        }
        if(this.check(0,TokenType.LPAR)){
            return this.parsePrimary();
        }
        if(this.check(0,TokenType.LBRACE)){
            return this.parseDictOrSetLiteral();
        }
        if(this.check(0,literalSet)){
            return this.parsePrimary();
        }
        if(this.check(0,TokenType.IDENTIFIER)){
            if(this.check(1,TokenType.LPAR)){
                return this.parseCallExpression();
            }
            return this.parsePrimary();
        }
        this.raiseError();
    }

    /**
     * 解析元组剩余部分
     */
    parseTupleLiteralRest(first){
        const elements=[first];
        const startLoc=first.loc.start;

        // 收集剩余元素
        do{
            if(this.check(0,TokenType.RPAR)||this.check(0,terminatorSet))break;
            elements.push(this.parseExpression());
        }while(this.match(TokenType.COMMA));

        const endLoc=elements[elements.length-1].loc.end;

        return new TupleLiteral(new Loc(...startLoc,...endLoc),elements);
    }

    /**
     * 解析列表字面量
     */
    parseListLiteral(){
        const startLoc=this.advance().loc.start;
        const elements=[];

        // 解析元素
        while(!this.check(0,TokenType.RSQB)){
            elements.push(this.parseExpression());
            this.match(TokenType.COMMA);
        }

        const endLoc=this.advance().loc.end;

        return new ListLiteral(new Loc(...startLoc,...endLoc),elements);
    }

    /**
     * 解析字典字面量或集合字面量
     */
    parseDictOrSetLiteral(){
        const startLoc=this.advance().loc.start;

        // 特殊处理：空字典
        if(this.check(0,TokenType.RBRACE)){
            const endLoc=this.advance().loc.end;
            return new DictLiteral(new Loc(...startLoc,...endLoc),[],[]);
        }
        
        // 判断是字典字面量还是集合字面量
        const first=this.parseExpression();
        
        if(this.check(0,TokenType.RBRACE)||this.match(TokenType.COMMA)){
            // 集合字面量
            const elements=[first];

            while(!this.check(0,TokenType.RBRACE)){
                elements.push(this.parseExpression());
                this.match(TokenType.COMMA);
            }

            const endLoc=this.advance().loc.end;
            return new SetLiteral(new Loc(...startLoc,...endLoc),elements);
        }else if(this.match(TokenType.COLON)){
            // 字典字面量
            const keys=[first];
            const values=[this.parseExpression()];
            this.match(TokenType.COMMA);

            while(!this.check(0,TokenType.RBRACE)){
                keys.push(this.parseExpression());
                this.consume(TokenType.COLON);
                values.push(this.parseExpression());
                this.match(TokenType.COMMA);
            }

            const endLoc=this.advance().loc.end;
            return new DictLiteral(new Loc(...startLoc,...endLoc),keys,values);
        }
        this.raiseError();
    }

    /**
     * 解析调用表达式
     */
    parseCallExpression(){
        const startLoc=this.peek().loc.start;
        const callee=new Identifier(this.peek().loc,this.advance().value);
        this.consume(TokenType.LPAR);

        const args=[];
        const keywords=[];

        // 先解析位置参数
        while(!this.check(0,TokenType.RPAR)){
            if(this.check(0,TokenType.IDENTIFIER)&&this.check(1,TokenType.ASSIGN)){
                break;
            }
            const arg=this.parseExpression();
            args.push(arg);
            this.match(TokenType.COMMA);
        }

        // 再解析关键字
        while(!this.check(0,TokenType.RPAR)){
            const keywordName=this.advance().value;
            if(!this.match(TokenType.ASSIGN)){
                this.raiseError('SyntaxError','positional argument follows keyword argument',this.previous().loc);
            }
            const keywordValue=this.parseExpression();
            keywords.push({name:keywordName,value:keywordValue});
            this.match(TokenType.COMMA);
        }

        const endLoc=this.advance().loc.end;

        return new CallExpression(new Loc(...startLoc,...endLoc),callee,args,keywords);
    }

    /**
     * 解析基本元素
     */
    parsePrimary(){
        if(this.check(0,literalSet)){
            const token=this.advance();
            return new Literal(token.loc,token.value);
        }
        if(this.check(0,TokenType.IDENTIFIER)){
            const token=this.advance();
            return new Identifier(token.loc,token.value);
        }
        if(this.check(0,TokenType.LPAR)){
            const startLoc=this.advance().loc.start;

            // 特殊处理：空元组
            if(this.check(0,TokenType.RPAR)){
                const endLoc=this.advance().loc.end;
                return new TupleLiteral(new Loc(...startLoc,...endLoc),[]);
            }

            const inner=this.parseExpressionWithTuple();

            const endLoc=this.peek().loc.end;
            this.consume(TokenType.RPAR);

            // 更新内部表达式的loc
            inner.loc=new Loc(...startLoc,...endLoc);

            return inner;
        }
        this.raiseError();
    }
}

