export class LiteralParser{
    /**
     * 解析Python字面量原始字符串为内部值（JavaScript值）
     * @param {string} raw 字面量原始字符串
     * @returns {[(null|boolean|string|number), boolean]} [`value`, `isComplex`]
     *   - `value`: 解析后的JavaScript值
     *   - `isComplex`: 是否为复数
     */
    static parse(raw){
        if(raw==='None'){
            return [null,false];
        }if(raw==='True'){
            return [true,false];
        }if(raw==='False'){
            return [false,false];
        }if((raw.startsWith('"""')&&raw.endsWith('"""')||
            raw.startsWith("'''")&&raw.endsWith("'''"))&&
            raw.length>=6){
            return [raw.slice(3,-3),false];
        }if(raw[0]==='"'&&raw[raw.length-1]==='"'||
            raw[0]==="'"&&raw[raw.length-1]==="'"){
            return [raw.slice(1,-1),false];
        }
        // 解析数字
        return this.parseNumber(raw);
    }

    /**
     * 解析数字字面量
     */
    static parseNumber(raw){
        const clean=raw.replace(/_/g,'');
        
        if(clean.endsWith('j')||clean.endsWith('J')){
            const numberPart=clean.slice(0,-1);
            const realVal=Number(numberPart);

            return [realVal,true]
        }
        
        return [Number(clean),false];
    }
}