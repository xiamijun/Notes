//存取localStorage中的数据
let store={
    save(key,value){
        localStorage.setItem(key,JSON.stringify(value));
    },
    fetch(key){
        return JSON.parse(localStorage.getItem(key)) ||[];
    }
};

let list=store.fetch('miaov-new-class');

// let list=[
//     {
//         title:'吃饭打豆豆',
//         isChecked:false,
//         editTodos:''
//     },
//     {
//         title:'吃饭打豆豆',
//         isChecked:true,
//         editTodos:''
//     },
// ];

let vm=new Vue({
    el:".main",
    data:{
        list:list,
        todo:'',
        editTodos:'',    //记录正在编辑的数据
        beforeTitle:'',       //记录正在编辑的数据的title
        visibility:'all'    //通过属性值变化对数据筛选
    },
    methods:{
        addTodo(ev) {
            //添加任务
            //this指向当前Vue根实例
            this.list.push({
                title:this.todo,
                isChecked:false
            });
            this.todo='';
        },
        deleteTodo(todo){
            //删除任务
            let index=this.list.indexOf(todo);
            this.list.splice(index,1);
        },
        editTodo(todo){
            //编辑任务
            //编辑之前记录title，方便取消编辑时回滚
            this.beforeTitle=todo.title;
            this.editTodos=todo;
        },
        editedTodo(todo){
            //编辑任务完成
            this.editTodos='';
        },
        cancelEdit(todo){
            //取消编辑
            todo.title=this.beforeTitle;
            //显示div，隐藏input
            this.editTodos='';
            // this.beforeTitle='';
        }
    },
    directives:{
        focus:{
            update(el,binding){
                if(binding.value){
                    el.focus();
                }
            }
        }
    },
    computed:{
        noCheckedLength:function () {
            return this.list.filter(item=>{
                return !item.isChecked;
            }).length;
        },
        filterList:function () {
            //过滤有3种情况：all，finished，unfinished
            // let filterObj={
            //     all:function (list) {
            //         return list;
            //     },
            //     finished:function (list) {
            //         return list.filter(item=>{
            //             return item.isChecked;
            //         });
            //     },
            //     unfinished:function (list) {
            //         return list.filter(item=>{
            //             return !item.isChecked;
            //         });
            //     }
            // };
            // return filterObj[this.visibility]?filterObj[this.visibility](this.list):this.list;

            switch (this.visibility){
                case 'all':
                    return this.list;
                    break;
                case 'finished':
                    return this.list.filter(item=>{
                        return item.isChecked;
                    });
                    break;
                case 'unfinished':
                    return list.filter(item=>{
                        return !item.isChecked;
                    });
                    break;
                default:
                    return this.list;
                    break;
            }

        }
    },
    watch:{
        // list:function () {
        //     //监控list，list变化时执行函数
        //     store.save('miaov-new-class',this.list);
        // }
        list:{
            handler:function () {
                store.save('miaov-new-class',this.list);
            },
            deep:true
        }
    }
});

function watchHashChange() {
    let hash=window.location.hash.slice(1);
    vm.visibility=hash;
}

watchHashChange();

window.addEventListener('hashchange',watchHashChange);