export class IndentManager{
    constructor(tabSize=4){
        this.stack=[0];  // 缩进栈
        this.tabSize=tabSize;
        this.pendingDedents=[];  // 待处理的DEDENT队列
    }

    /**
     * 处理新行的缩进
     * @param {number} spaces 当前行的缩进空格数
     * @returns {Array} 需要生成的INDENT/DEDENT token信息
     */
    processIndent(spaces){
        const currIndent=this.stack[this.stack.length-1];
        const result=[];

        if(spaces>currIndent){
            // 缩进增加
            this.stack.push(spaces);
            result.push({type:'INDENT',level:spaces});
        }else if(spaces<currIndent){
            // 缩进减少
            while(this.stack.length>1&&this.stack[this.stack.length-1]>spaces){
                this.stack.pop();
                result.push({type:'DEDENT',level:this.stack[this.stack.length-1]});
            }
            // 检查缩进是否对齐
            if(this.stack[this.stack.length-1]!==spaces){
                // 缩进错误
                result.push({
                    type:'INDENT_ERROR',
                    message:`unindent does not match any outer indentation level`,
                    expected:this.stack[this.stack.length-1],
                    actual:spaces
                });
            }
        }
        // spaces===currIndent 时不需要操作

        return result;
    }

    /**
     * 获取当前缩进级别
     */
    getCurrentIndent(){
        return this.stack[this.stack.length-1];
    }

    /**
     * 文件结束时，DEDENT回0
     * @returns {Array} - 需要生成的DEDENT token信息
     */
    endOfFile(){
        const result=[];
        while(this.stack.length>1){
            this.stack.pop();
            result.push({type:'DEDENT',level:this.stack[this.stack.length-1]});
        }
        return result;
    }

    /**
     * 计算字符串（代码）的缩进空格数
     */
    calcSpaces(indentStr){
        let spaces=0;
        for(const char of indentStr){
            if(char===' ')spaces++;
            else if(char==='\t')spaces+=this.tabSize;
        }
        return spaces;
    }

    /**
     * 调试：获取缩进栈
     */
    getStack(){
        return [...this.stack];
    }
}