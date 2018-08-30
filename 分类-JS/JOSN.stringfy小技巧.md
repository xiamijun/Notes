## JSON.stringify()的另外两个参数。  
`JSON.stringify(value[, replacer [, space]])`  
参数：  
* `value`：将要被序列化的变量的值  
* `replacer`：替代器。如果该参数是一个函数，则被序列化的值的每个属性都会经过该函数的转换和处理；如果该参数是一个数组，则只有包含在这个数组中的属性名才会被序列化到最终的JSON字符串中  
* `space`：指定缩进用的空白字符串，用于美化输出，可以是数字或者字符串。如果参数是个数字，它代表有多少的空格；上限为10。该值若小于1，则意味着没有空格；如果该参数为字符串(字符串的前十个字母)，该字符串将被作为空格；  

#### 使用函数过滤并序列化对象：
```javascript
// 使用“函数”当替代器
function replacer(key, value) {
  if (typeof value === "string") {
    return undefined;
  }
  return value;
}

let foo = {
  foundation: "Mozilla", 
  model: "box", 
  week: 45, 
  transport: "car", 
  month: 7
};
let jsonString = JSON.stringify(foo, replacer);

// {"week":45,"month":7}
```

#### 使用数组过滤并序列化对象：
```javascript
// 使用“数组”当替代器
let user = {
  name: 'zollero',
  nick: 'z',
  skills: ['JavaScript', 'CSS', 'HTML5']
};
JSON.stringify(user, ['name', 'skills'], 2);

// "{
//   "name": "zollero",
//   "skills": [
//     "JavaScript",
//     "CSS",
//     "HTML5"
//   ]
// }"
```

## 对象的`toJSON`属性  
如果一个对象有`toJSON`属性，当它被序列化的时候，不会对该对象进行序列化，而是将它的`toJSON`方法的返回值进行序列化。  

例子：
```javascript
let obj = {
  foo: 'foo',
  toJSON: function () {
    return 'bar';
  }
};
JSON.stringify(obj);      // '"bar"'
JSON.stringify({x: obj}); // '{"x":"bar"}'
```