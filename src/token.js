import {Loc} from './location.js';

export class Token{
    /**
     * @param {Loc} loc 位置信息
     */
    constructor(type,value,loc){
        this.type=type;
        this.value=value;
        this.loc=loc;
    }
    toString(){
        return `${this.type}('${this.value}') at ${this.loc}`
    }
}

export const TokenType={
    COMMENT:'COMMENT',
    WHITESPACE:'SPACE',

    INDENT:'INDENT',  // 缩进
    DEDENT:'DEDENT',  // 减少缩进
    NEWLINE:'NEWLINE',

    STRING:'STRING',
    NUMBER:'NUMBER',
    TRUE:'TRUE',
    FALSE:'FALSE',
    NONE:'NONE',

    ASSIGN:'ASSIGN',
    SEMICOLON:'SEMICOLON',
    COLON:'COLON',
    COMMA:'COMMA',
    LPAR:'LPAR',
    RPAR:'RPAR',
    LSQB:'LSQB',
    RSQB:'RSQB',
    LBRACE:'LBRACE',
    RBRACE:'RBRACE',

    IDENTIFIER:'IDENTIFIER',

    CONTINUATION:'CONTINUATION',

    ERROR:'ERROR',

    EOF:'EOF'
}

export const literalSet=new Set([
    TokenType.STRING,
    TokenType.NUMBER,
    TokenType.TRUE,
    TokenType.FALSE,
    TokenType.NONE
]);

export const terminatorSet=new Set([
    TokenType.NEWLINE,
    TokenType.SEMICOLON,
    TokenType.EOF
]);


