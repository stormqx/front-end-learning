> rem unit: Represents the font-size of the root element (typically <html>). When used within th> root element font-size, it represents its initial value (a common browser default is 16px, but user-defined preferences may modify this)

## 关于像素的几个概念

1. 设备像素/物理像素: 是显示设备中一个最微小的物理部件。
2. 屏幕密度: 通常以每英寸有多少物理像素来计算（PPI）。
3. 独立像素/CSS像素: CSS像素是一个抽象的单位，主要使用在浏览器上，用来精确的度量（确定）Web页面上的内容。一般情况下，CSS像素被称为与设备无关的像素（device-independent像素），简称为“DIPs”。在一个**标准的显示密度**下，一个CSS像素对应着一个设备像素。
4. 独立像素比/window.devicePixelRatio: window.devicePixelRatio=物理像素/独立像素。

## rem数值计算

对于sass工程，我们可以提供一个scss function来转化px和rem.

```sass
@function px2rem($px){
    $rem : 37.5px;
    @return ($px/$rem) + rem;
}
```

使用的时候, `height: px2rem(90px)`。有人可能会好奇为什么`$rem`是`37.5px`, 默认的是`16px`呀。下面要解释一下：

1. 早几年提供的设计稿是以iphone6为基准的。
2. iphone6的屏幕大小是375px。

`rem = window.innerWidth  / 10`, 这里除以10只是为了计算方便。

## 动态设置html的`font-size`

```js
document.documentElement.style.fontSize = document.documentElement.clientWidth / 10 + 'px';
```

## rem进阶

一般我们获取到的视觉稿大部分是iphone6的，所以我们看到的尺寸一般是双倍大小的，在使用rem之前，我们一般会自觉的将标注/2，其实这也并无道理，但是当我们配合rem使用时，完全可以按照视觉稿上的尺寸来设置。

1. 设计稿是双倍尺寸的原因，iphone6是高清屏，设备像素比(device pixel ratio)dpr比较大，所以显示的像素较为清晰。
2. 一般手机的dpr是1，iphone4，iphone5这种高清屏是2，iphone6s plus这种高清屏是3，可以通过js的window.devicePixelRatio获取到当前设备的dpr，所以iphone6给的视觉稿大小是（*2）750×1334了。
3. 拿到了dpr之后，我们就可以在viewport meta头里，取消让浏览器自动缩放页面，而自己去设置viewport的content例如（这里之所以要设置viewport是因为我们要实现border1px的效果，加入我给border设置了1px，在scale的影响下，高清屏中就会显示成0.5px的效果）

```js
var dpr = window.devicePixelRatio;
document.querySelector('meta[name="viewport"]').setAttribute('content','width=device-width,initial-scale=' + 1/dpr + ', maximum-scale=' + 1/dpr + ', minimum-scale=' + 1/dpr + ', user-scalable=no');

```

4. 设置后配合修改后的`px2rem function`,

```js
@function px2rem($px){
    $rem : 75px;
    @return ($px/$rem) + rem;
}
```

这样做的好处:
1. 解决了图片高清问题。
2. 解决了border 1px问题（我们设置的1px，在iphone上，由于viewport的scale是0.5，所以就自然缩放成0.5px）

在iphone6下的例子：

我们使用动态设置viewport，在iphone6下，scale会被设置成1/2即0.5，其他手机是1/1即1.

## rem不足
1. 当用作图片或者一些不能缩放的展示时，必须要使用固定的px值，因为缩放可能会导致图片压缩变形等。
