使用纯css来实现slide动画的困难点在于: **很多情况下，展示内容的高度是不固定的**。

## 利用`max-height`和`overflow`实现slide动画。


```css
.slider {
  overflow-y: hidden;
  max-height: 500px; /* 使用最合适的max-height */
  transition: all .5s ease;
}

.slider .closed {
  max-height: 0;
}
```

```html
<div class='slider'> some content here... </div>
```

这种情况有一个缺点是如果slider的内容触发了`overflow`后会被截断。如果设置`overflow:auto`的话，内容不会被截断，这会导致在slideup的时候会出现scroll.

## 利用`scale`来实现slide动画。

```css
.slidedown {
  -webkit-transform: scaleY(0);
       -o-transform: scaleY(0);
      -ms-transform: scaleY(0);
          transform: scaleY(0);
  
  -webkit-transform-origin: top;
       -o-transform-origin: top;
      -ms-transform-origin: top;
          transform-origin: top;
  
  -webkit-transition: -webkit-transform 0.2s ease;
            -o-transition: -o-transform 0.2s ease;
          -ms-transition: -ms-transform 0.2s ease;
                  transition: transform 0.2s ease;
}

.slidedown.active {
  -webkit-transform: scaleY(1);
       -o-transform: scaleY(1);
      -ms-transform: scaleY(1);
          transform: scaleY(1);
}

```

```html
<div class="slidedown">
      Revealing content using a transition based on height or max-height can often get complicated, especially if your content is dynamic.
      Here's an example of some content being revealed using transform: scaleY(); This works no matter what the content.
</div>    
```
这种

