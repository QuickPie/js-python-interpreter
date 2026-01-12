export class Loc{
    constructor(startLine,startCol,endLine,endCol){
        this.startLine=startLine;
        this.startCol=startCol;
        this.endLine=endLine;
        this.endCol=endCol;
    }

    toString(){
        return `(${this.startLine},${this.startCol})-(${this.endLine},${this.endCol})`
    }

    get start(){
        return {line:this.startLine,col:this.startCol};
    }

    get end(){
        return {line:this.endLine,col:this.endCol};
    }
}