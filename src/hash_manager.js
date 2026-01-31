import {PyTuple} from './builtins.js';

/**
 * 哈希管理器
 * 
 * 生成和缓存对象的哈希
 */
export class HashManager{
    static #stringSecret=this.#generateSecret(); // 随机密钥
    static #cache=new WeakMap();  // 缓存已计算的哈希
    static #fixed=new Map([  // 特殊值的固定哈希
        [null,0],
        [true,1],
        [false,0],
        [undefined,0]
    ]);

    /**
     * 生成随机密钥
     */
    static #generateSecret(){
        // TODO: 设置环境变量 PYTHON_HASH_SEED

        // 随机生成
        const array=new Uint32Array(2);
        crypto.getRandomValues(array);
        return array[0];
    }

    /**
     * 生成、缓存并返回对象的专属哈希
     */
    static hash(obj){
        // 检查缓存
        if(this.#cache.has(obj)){
            return this.#cache.get(obj);
        }

        // 首次计算哈希
        let h;
        if(this.#fixed.has(obj)){
            h=this.#fixed.get(obj);
        }else if(typeof obj==='number'){
            h=this.#hashNumber(obj);
        }else if(typeof obj==='string'){
            h=this.#hashString(obj);
        }else if(obj instanceof PyTuple){
            h=this.#hashTuple(obj);
        }

        h=h|0;  //  确保是32位有符号整数

        if(h===-1)h=-2;  // -1在python中会被转换为-2

        this.#cache.set(obj,h);
        return h;
    }

    /**
     * 数字哈希
     */
    static #hashNumber(n){
        // 整数
        if(Number.isInteger(n)){
            // 对 2^61-1 取模
            return n%(2**61-1);
        }

        // 浮点数：转换为位表示
        const view=new DataView(new ArrayBuffer(8));
        view.setFloat64(0,n);
        const bits=view.getBigUint64(0);

        // 取低32位作为哈希
        return Number(bits&0xFFFFFFFFn);
    }

    /**
     * 字符串哈希
     */
    static #hashString(s){
        let v0=this.#stringSecret;
        let v1=0;

        for(let i=0;i<s.length;i++){
            const c=s.charCodeAt(i);
            v0^=c;
            v0=(v0<<13)|(v0>>>19);  // 旋转
            v0=(v0+v1)|0;
            v1=(v1<<8)|(v1>>>24);
            v1^=c;
        }

        v0^=s.length;
        v1^=s.length;

        return (v0^v1)|0;
    }

    /**
     * 元组哈希
     */
    static #hashTuple(t){
        let hash=0x345678;
        for(const item of t){
            const itemHash=this.hash(item);
            hash=(hash^itemHash)*1000003;
            hash&=0xFFFFFFFF;
        }
        hash^=t.length;
        return hash;
    }
}