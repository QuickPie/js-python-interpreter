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
        return [this.startLine,this.startCol];
    }

    get end(){
        return [this.endLine,this.endCol];
    }
}