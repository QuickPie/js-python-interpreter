import {Loc} from './location.js';
import {Token,TokenType} from './token.js';
import {tokenPatterns} from './token_patterns.js';
import {IndentManager} from './indent_manager.js';

/**
 * 词法分析器
 * 
 * 将Python代码转换成标记流
 */
export function lexer(code){
    const tokens=[];
    let pos=0;
    let line=1;
    let col=0;
    
    const indentManager=new IndentManager();
    let atLineStart=true;

    while(pos<code.length){
        // === 步骤1：处理行首缩进 ===
        if(atLineStart){
            const indentMatch=code.slice(pos).match(/^([ \t]+)\S+/);
            let currIndent=0;

            if(indentMatch){
                currIndent=indentManager.calcSpaces(indentMatch[1]);

                // 处理缩进变化
                const indentResults=indentManager.processIndent(currIndent);
                for(const result of indentResults){
                    if(result.type==='INDENT'){
                        tokens.push(new Token(TokenType.INDENT,currIndent,new Loc(line,col,line,col)));
                    }else if(result.type==='DEDENT'){
                        tokens.push(new Token(TokenType.DEDENT,currIndent,new Loc(line,col,line,col)));
                    }else if(result.type==='INDENT_ERROR'){
                        tokens.push(new Token(TokenType.ERROR,`IndentationError: ${result.message}`,new Loc(line,col,line,col)))
                    }
                }
                pos+=indentMatch[0].length;
                col+=indentMatch[0].length;
            }else{
                // 没有缩进，也可能需要DEDENT回0
                currIndent=0;
                const indentResults=indentManager.processIndent(0);
                for(const result of indentResults){
                    if(result.type==='DEDENT'){
                        tokens.push(new Token(TokenType.DEDENT,'DEDENT',new Loc(line,col,line,col)));
                    }
                }
            }
            atLineStart=false;
        }

        // === 步骤2：正常token匹配 ===
        let matched=false;
        
        for(const [type,pattern] of tokenPatterns){
            const regex=new RegExp(pattern.source,pattern.flags);
            const match=code.slice(pos).match(regex);

            if(match){
                matched=true;
                const value=match[0];
                
                // 更新位置
                const lines=value.split('\n');
                const endLine=line+lines.length-1;
                const endCol=lines.length===1?col+value.length:(lines[lines.length-1].length>0?lines[lines.length-1].length+1:0)

                // 特殊处理
                if(type===TokenType.CONTINUATION){
                    pos+=value.length;
                    line=endLine;
                    col=endCol;
                    continue;
                }else if(type===TokenType.NEWLINE){
                    atLineStart=true;
                    tokens.push(new Token(type,'\\n',new Loc(line,col,endLine,endCol)));
                }else if(![
                    TokenType.WHITESPACE,
                    TokenType.COMMENT,
                ].includes(type)){
                    tokens.push(new Token(type,value,new Loc(line,col,endLine,endCol)));
                }
                pos+=value.length;
                line=endLine;
                col=endCol;
                break;
            }
        }
        if(!matched){
            // 无法匹配时，区分不同类型的非法字符
            const char=code[pos];

            // 检查字符类型
            let errorMsg='SyntaxError: ';
            if(/[\uff00-\uffff]/.test(char)){
                errorMsg+=`invalid character in identifier`;
            }else{
                errorMsg+=`invalid syntax`;
            }

            tokens.push(new Token(TokenType.ERROR,errorMsg,new Loc(line,col,line,col+1)));
            pos++;
            col++;
        }
    }
    const finalDedents=indentManager.endOfFile();
    for(const dedent of finalDedents){
        tokens.push(new Token(TokenType.DEDENT,'DEDENT',new Loc(line,col,line,col)));
    }
    tokens.push(new Token(TokenType.EOF,'',new Loc(line,col,line,col)));
    return deleteRedundantNewlines(tokens);
}

/**
 * 删除数组中冗余的`TokenType.NEWLINE`
 */
function deleteRedundantNewlines(tokens){
    const result=[];
    let lastWasNewline=false;

    // 删除开头换行
    while(tokens.length>0&&tokens[0].type===TokenType.NEWLINE)tokens.shift();

    // 合并连续换行
    for(const token of tokens){
        if(token.type===TokenType.NEWLINE){
            if(!lastWasNewline){
                result.push(token);
                lastWasNewline=true;
            }
        }else{
            result.push(token);
            lastWasNewline=false;
        }
    }
    
    return result;
}