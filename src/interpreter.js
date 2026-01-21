import {Environment} from './environment.js';
import {PyError} from './errors.js';
import {Builtins} from './builtins.js';

export class Interpreter{
    constructor(sourceCode){
        this.environment=new Environment();
        this.output=[];
        this.code=sourceCode;
        Builtins.setupAll(this);
    }

    /**
     * 便捷报错方法
     */
    raiseError(type,msg,loc,scopeName=this.environment.name,cause=null){
        throw new PyError(type,msg,loc,scopeName,cause,this.code);
    }

    /**
     * 遍历AST并执行
     */
    interpret(program){
        try{
            for(const stmt of program.body){
                // 执行语句
                this.execute(stmt);
            }

            console.log(this.output,this.output.join(''));
            return this.output.join('');
        }catch(error){
            // 运行时错误
            if(error.pythonic){
                return error;
            }else{
                throw error;
            }
        }
    }

    /**
     * 执行单个AST节点
     */
    execute(node){
        switch(node.type){
            case 'Literal':
                return node.value;
            case 'Identifier':
                return this.evalIdentifier(node);
            case 'CallExpression':
                return this.evalCallExpression(node);
            case 'ExpressionStatement':
                return this.execExpressionStatement(node);
            case 'BlockStatement':
                return this.execBlockStatement(node);
        }
    }

    /**
     * 求值标识符
     */
    evalIdentifier(node){
        if(!this.environment.get(node.name)){
            this.raiseError('NameError',`name '${node.name}' is not defined`,node.loc);
        }
        return this.environment.get(node.name);
    }
    
    /**
     * 求值调用表达式
     */
    evalCallExpression(node){
        const func=this.execute(node.callee);

        // 计算位置参数
        const args=node.arguments.map(arg=>this.execute(arg));

        // 计算关键字参数
        const kwargs={};
        for(const kw of node.keywords){
            kwargs[kw.name]=this.execute(kw.value);
        }

        // 调用函数
        return func(args,kwargs);
    }

    /**
     * 执行表达式语句
     */
    execExpressionStatement(node){
        return this.execute(node.expression);
    }

    /**
     * 执行块语句
     */
    execBlockStatement(node){
        for(const stmt of node.body){
            this.execute(stmt);
        }
    }
}