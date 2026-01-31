import {TokenType} from './token.js';

export const tokenPatterns=[
    [TokenType.COMMENT,/^#[^\n]*/],
    [TokenType.CONTINUATION,/^\\\n/],
    [TokenType.NEWLINE,/^\n/],
    [TokenType.STRING,/^((?:[rRfFbBuU]|[rR][fF]|[fF][rR]|[bB][rR]|[rR][bB])?(?:'''(?:[^'\\]|\\.|'(?!'')|''(?!'))*'''|"""(?:[^"\\]|\\.|"(?!"")|"(?!"))?"""|'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"))/],
    [TokenType.NUMBER,/^(?:0[bB](?:_?[01]+)*|0[oO](?:_?[0-7]+)*|0[xX](?:_?[\da-fA-F]+)*|(?:\d+(?:_\d+)*\.|\.\d+(?:_\d+)*)(?:(?:\d+(?:_\d+)*)?(?:[eE][+-]?\d+(?:_\d+)*)?)?[jJ]?|(?:[1-9]\d*)(?:_\d+)*(?:[eE][+-]?\d+(?:_\d+)*)?[jJ]?)/],
    [TokenType.TRUE,/^\bTrue\b/],
    [TokenType.FALSE,/^\bFalse\b/],
    [TokenType.NONE,/^\bNone\b/],
    [TokenType.ASSIGN,/^=/],
    [TokenType.SEMICOLON,/^;/],
    [TokenType.COLON,/^:/],
    [TokenType.COMMA,/^,/],
    [TokenType.LPAR,/^\(/],
    [TokenType.RPAR,/^\)/],
    [TokenType.LSQB,/^\[/],
    [TokenType.RSQB,/^\]/],
    [TokenType.LBRACE,/^\{/],
    [TokenType.RBRACE,/^\}/],
    [TokenType.IDENTIFIER,/^[a-zA-Z_\u4e00-\u9fff][a-zA-Z0-9_\u4e00-\u9fff]*/],
    [TokenType.WHITESPACE,/^[ \t]+/],
]