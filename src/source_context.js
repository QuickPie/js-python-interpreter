export class SourceContext{
    constructor(sourceCode){
        this.code=sourceCode;
        this.lines=sourceCode.split('\n').map(line=>line.trim());
        this.lineStarts=this._calcLineStarts();
    }

    /**
     * 计算每行在源代码中的起始位置
     */
    _calcLineStarts(){
        const starts=[0];  // 第1行从位置0开始
        let pos=0;

        for(let i=0;i<this.code.length;i++){
            if(this.code[i]==='\n'){
                pos=i+1;
                starts.push(pos);  // 推入下一行的起始位置
            }
        }

        return starts;
    }

    /**
     * 将位置转换为行号和列号
     * @param {number} pos 字符的位置
     */
    getLineAndColumn(pos){
        // 边界处理
        if(position<0){
            throw new Error(`Invalid position: ${pos}`);
        }
        if(pos>=this.code.length) {
            throw new Error(`Position ${pos} exceeds source length ${this.code.length}`);
        }

        for(let line=0;line<this.lineStarts.length;i++){
            const nextLineStart=line+1<this.lineStarts.length
                ?this.lineStarts[line+1]
                :this.code.length;

            if(pos>=this.lineStarts[line]&&pos<nextLineStart){
                return {
                    line:line+1,
                    column:pos-this.lineStarts[line]+1
                };
            }
        }
    }

    /**
     * 获取某行（从1开始）的源代码
     */
    getLineContent(line){
        // 边界处理
        if(line<1){
            throw new Error(`Invalid line number: ${line}`);
        }
        if(line>this.lines.length){
            throw new Error(`Line number ${line} exceeds line count ${this.code.length}`);
        }

        return this.lines[line-1];
    }
}