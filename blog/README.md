# JS运行机制

## 进程和线程

* 进程之间相互独立。
* 一个进程由一个或多个线程组成。
* 多个线程在进程中协作完成任务。
* 同一进程下的各个线程之间共享程序的内存空间。
* 进程是cpu资源分配的最小单位。
* 线程是cpu调度的最小单位。

## 浏览器是多进程的

* 浏览器每打开一个tab标签页，任务管理器会多加一条记录。

### 浏览器包含哪些进程
1. Browser进程  
主进程，只有一个  
作用：用户交互，如前进，后退。页面的管理，创建和销毁其他进程。网络资源管理，下载。

2. 第三方插件进程

3. GPU进程  
用于3D绘制

4. 浏览器渲染进程（浏览器内核）  
`Renderer`进程，内部是多线程的

### 浏览器内核（渲染进程）
* 页面的渲染，JS的执行，事件的循环，都在这个进程内进行。  
* 渲染进程是多线程的

#### 浏览器渲染进程包含的线程
1. GUI渲染线程  
&ensp; &ensp; 解析HTML，CSS，构建DOM树和RenderObject树，布局和绘制等。  
&ensp; &ensp; 注：GUI渲染线程与JS引擎线程是互斥的，当JS引擎执行时GUI线程会被挂起，GUI更新会被保存在一个队列中等到JS引擎空闲时立即被执行。

2. JS引擎线程  
&ensp; &ensp; 例如V8引擎。 
 
3. 事件触发线程  
&ensp; &ensp; 归属于浏览器而不是JS引擎，用来控制事件循环（可以理解，JS引擎自己都忙不过来，需要浏览器另开线程协助）。  
&ensp; &ensp; 当JS引擎执行如`setTimeOut`、`AJAX`异步请求等时，会将对应任务添加到事件线程中。  
&ensp; &ensp; 当对应的事件符合触发条件被触发时，该线程会把事件添加到待处理队列的队尾，等待JS引擎的处理。  
&ensp; &ensp; 由于JS的单线程关系，所以这些待处理队列中的事件都得排队等待JS引擎处理（当JS引擎空闲时才会去执行）。 
 
4. 定时触发器线程  
&ensp; &ensp; `setInternal`与 `setTimeout`所在线程。  
&ensp; &ensp; 浏览器定时计数器并不是由JavaScript引擎计数的。  
&ensp; &ensp; 通过单独线程来计时并触发定时（计时完毕后，添加到事件队列中，等待JS引擎空闲后执行）。  
&ensp; &ensp; 规定要求`setTimeout`中低于`4ms`的时间间隔算为`4ms`。  

5. 异步http请求线程  
&ensp; &ensp; `XMLHttpRequest`在连接后通过新开一个线程请求。  
&ensp; &ensp; 检测到状态变更时，如果设置有回调函数，异步线程就产生状态变更事件，将这个回调再放入事件队列中。再由JavaScript引擎执行。  
![图](./1.png)  
### Browser进程和浏览器内核（Renderer进程）的通信过程
* `Browser`进程收到用户请求，获取页面内容（如通过网络下载资源），随后将该任务通过`RendererHost`接口传递给`Render`进程。  

* `Renderer`进程收到消息，简单解释后，交给渲染线程，然后开始渲染。  
&ensp; &ensp; 渲染线程接收请求，加载网页并渲染网页。  
&ensp; &ensp; 可能会有JS线程操作DOM（这样可能会造成回流并重绘）。  
&ensp; &ensp; 最后`Render`进程将结果传递给`Browser`进程。  

* `Browser`进程接收到结果并将结果绘制出来。

### GUI渲染线程与JS引擎线程互斥  
* 当JS引擎执行时GUI线程会被挂起  

* 巨量计算阻塞页面加载

### WebWorker
* 应对cpu密集型计算

* 创建`Worker`时，JS引擎向浏览器申请开一个子线程（子线程是浏览器开的，完全受主线程控制，而且不能操作DOM）
* JS引擎线程与`worker`线程间通过特定的方式通信
* JS引擎是单线程的，本质仍然未改变

## 浏览器渲染流程
1. 解析`html`建立`dom`树

2. 解析`css`构建`render`树（将`CSS`代码解析成树形的数据结构，然后结合`DOM`合并成`render`树）

3. 布局`render`树（`Layout/reflow`），负责各元素尺寸、位置的计算

4. 绘制`render`树（`paint`），绘制页面像素信息

5. 浏览器会将各层的信息发送给GPU，GPU会将各层合成（`composite`），显示在屏幕上。

## 从Event Loop谈JS的运行机制  
概念： 
* JS分为`同步任务`和`异步任务`

* 同步任务都在`主线程`上执行，形成一个`执行栈`

* 主线程之外，`事件触发线程`管理着一个`任务队列`，只要`异步任务`有了运行结果，就在`任务队列`之中放置一个事件。

* 一旦`执行栈`中的所有`同步任务`执行完毕（此时JS引擎空闲），系统就会读取`任务队列`，将可运行的`异步任务`添加到`执行栈`中，开始执行。  
![event Loop](./2.png)  

### 定时器
定时器是JS引擎检测的么？当然不是了。它是由定时器线程控制（因为JS引擎自己都忙不过来，根本无暇分身）。   
``` javascript
setTimeout(function(){
   console.log('hello!');
},1000);
```
1000毫秒计时完毕后（由定时器线程计时），将回调函数推入事件队列中，等待主线程执行。   

``` javascript
setTimeout(function(){
   console.log('hello!');
},0);
```
* 以最快的时间内将回调函数推入事件队列中，等待主线程执行。
  
* W3C在HTML标准中规定，规定要求`setTimeout`中低于`4ms`的时间间隔算为`4ms`。

### setTimeout而不是setInterval
* `setInterval`是每次都精确的隔一段时间推入一个事件

 * 但是，事件的实际执行时间不一定就准确，还有可能是这个事件还没执行完毕，下一个事件就来了。
 
 * 致命问题：累计效应
 
### macrotask与microtask

``` javascript
console.log('script start');

setTimeout(function(){
   console.log('setTimeout');
},0);

Promise.resolve().then(function(){
   console.log('promise1');
}).then(function(){
   console.log('promise2');
});

console.log('script end');
```
正确结果：  
``` javascript
script start
script end
promise1
promise2
setTimeout
```
* 因为`Promise`里有了一个一个新的概念： `microtask`
* JS中分为两种任务类型：`macrotask`和`microtask`，在`ECMAScript`中，`microtask`称为`jobs`，`macrotask`可称为`task`
##### 定义和区别
* `macrotask`（又称之为`宏任务`）  
&ensp; &ensp; 可以理解是每次`执行栈`执行的代码就是一个`宏任务`（包括每次从事件队列中获取一个事件回调并放到执行栈中执行）。  
&ensp; &ensp; 每一个`macrotask`会从头到尾将这个任务执行完毕，不会执行其它。  
&ensp; &ensp; 浏览器为了能够使得JS内部`macrotask`与DOM任务能够有序的执行，会在一个`macrotask`执行结束后，在下一个`macrotask`执行开始前，对页面进行重新渲染。  
（`task->渲染->task->...`）   

* `microtask`（又称为`微任务`）  
&ensp; &ensp; 可以理解是在当前`macrotask`执行结束后立即执行的任务。  
&ensp; &ensp; 也就是说，在当前`macrotask`任务后，下一个`macrotask`之前，在渲染之前。  
&ensp; &ensp; 所以它的响应速度相比`setTimeout`（`setTimeout`是`macrotask`）会更快。  
##### 场景  
* `macrotask`：
主代码块，`setTimeout`，`setInterval`等（可以看到，事件队列中的每一个事件都是一个`macrotask`）

* `microtask`：
`Promise`，`process`.`nextTick`等

##### 总结
![总结](./3.png)
