/**
 * Created on 21/03/2017.
 */


class Sort {
    constructor() {
        this.data = [2,5,3,-1,6,9,0,123,43];
    }

    executeSort() {
        console.log('测试数据集:', this.data);
        this.insertSort(this.data);
        this.shellSort(this.data);
        console.log('quickSort结果：', this.quickSort(this.data));
        console.log('mergeSort结果：', this.mergeSort(this.data));

    }

    // 插入排序
    insertSort(array) {
        if(!array.length) return ;
        for(var i=1; i<array.length; i++) {
            var temp = array[i];
            for(var j=i-1; temp < array[j]&&j>=0; j--) {
                array[j+1] = array[j];
            }
            array[j+1] = temp;
        }
        console.log('插入排序结果：', array);
        return array;
    }

    // 希尔排序
    shellSort(array) {
        if(!array.length) return ;
        for(var incre =array.length; incre > 0; incre=parseInt(incre/2)) {
            for(var i=incre; i<array.length; i++) {
                var temp = array[i];
                for(var j=i-incre; temp<array[i]&&j>=9; j-=incre) {
                    array[j+incre] = array[j];
                }
                array[j+incre] = temp;
            }
        }
        console.log('shellsort结果：', array);
        return array;
    }

    // 快速排序
    quickSort(array) {
    if (array.length < 2) { return array; }

    var pivot = array[Math.round(array.length / 2)];

    return this.quickSort(array.filter(x => x <  pivot))
        .concat(array.filter(x => x == pivot))
        .concat(this.quickSort((array.filter(x => x >  pivot))));
    };

    merge(left, right, arr) {
        var a = 0;

        while (left.length && right.length) {
            arr[a++] = (right[0] < left[0]) ? right.shift() : left.shift();
        }
        while (left.length) {
            arr[a++] = left.shift();
        }
        while (right.length) {
            arr[a++] = right.shift();
        }
    }

    mergeSort(arr) {
        var len = arr.length;
        if (len === 1) { return; }

        var mid = Math.floor(len / 2),
            left = arr.slice(0, mid),
            right = arr.slice(mid);

        this.mergeSort(left);
        this.mergeSort(right);
        this.merge(left, right, arr);
    }

}

// 给Array.prototype添加quick_sort方法
Array.prototype.quick_sort = function () {
    if (this.length < 2) { return this; }

    var pivot = this[Math.round(this.length / 2)];

    return this.filter(x => x <  pivot)
        .quick_sort()
        .concat(this.filter(x => x == pivot))
        .concat(this.filter(x => x >  pivot).quick_sort());
};

// 给Array.prototype添加bubble_sort方法
Array.prototype.bubbleSort = function() {
    var done = false;
    while (!done) {
        done = true;
        for (var i = 1; i<this.length; i++) {
            if (this[i-1] > this[i]) {
                done = false;
                [this[i-1], this[i]] = [this[i], this[i-1]]
            }
        }
    }
    return this;
}

Array.prototype.bubbleSort1 = function () {
    var done = false;
    for(var i=0; done==false && i<this.length; i++) {
        done=true;
        for(var j=0; j<this.length-i; j++) {
            if(this[j]>this[j+1]) {
                done = false;
                [this[j], this[j+1]] = [this[j+1], this[j]];
            }
        }
    }
    return this;
}



var sort = new Sort();
sort.executeSort();