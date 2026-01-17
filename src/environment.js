export class Environment{
    /**
     * @param {Environment|null} parent 父作用域
     */
    constructor(parent=null){
        this.store=new Map();
        this.parent=parent;
    }

    /**
     * 获取变量值
     */
    get(name){
        if(this.store.has(name)){
            return this.store.get(name);
        }
        if(this.parent){
            return this.parent.get(name);
        }
    }

    set(name,value){
        this.store.set(name,value);
    }

    /**
     * 创建子作用域
     */
    createChild(){
        return new Environment(this);
    }
}