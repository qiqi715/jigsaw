(function() {
    var oStyle = document.querySelector('style');
    var oList = document.querySelector('.list');
    var aLi;
    var oStart = document.getElementById('start');
    var oRestart = document.getElementById('restart');

    var oLevel = document.querySelector('.level span');
    var oNum = document.querySelector('.num span');
    var oTime = document.querySelector('.time span');

    var zIndex = 1;
    var small = {};
    var info = {};
    setLevel(1);

    /*取消右键菜单*/
    document.addEventListener('contextmenu', function (ev) {
        ev.preventDefault();
    });

    /*重置游戏*/
    function restart() {
        oStart.value = '开始游戏';
        setLevel(1);
    }

    /*重新开始游戏*/
    function start() {
        var attrs = [];
        aLi.forEach(function(li) {
            attrs.push({'left': css(li, 'left'), 'top': css(li, 'top')});
        });
        attrs.sort(function (el1, el2) {
            return (Math.random() - .5);
        });
        aLi.forEach(function(li, index) {
            startMove(li, attrs[index], 200, 'linear');
        });
        startTime();
        if (!info.start) {
            info.start = true;
            oStart.value = '重新开始游戏';
            setMove();
        }
    }

    /*设定第几关*/
    function setLevel(level) {
        info.level = level;
        info.start = false;
        info.row = level + 1;
        info.col = level + 1;
        oLevel.innerHTML = level;
        clear();
        createData();
        oStart.addEventListener('click', start);
        oRestart.addEventListener('click', restart);
    }

    /*生成数据*/
    function createData() {
        var iWidth = css(oList, 'width') / info.col;
        var iHeight = css(oList, 'height') / info.row;
        var inner = '';
        oStyle.innerHTML = '.list li { width: ' + iWidth + 'px;height: ' + iHeight + 'px;}';
        for (var i = 0; i < info.row; i++) {
            for (var j = 0; j < info.col; j++) {
                inner +='<li style="left: ' + (iWidth + 3) * j + 'px;top: ' + (iHeight + 3) * i + 'px;' +
                    'background-position: -' + iWidth * j + 'px -' + (iHeight * i) + 'px"></li>'
            }
        }
        oList.innerHTML = inner;

        aLi = document.querySelectorAll('.list li');
        for (var i = 0; i < info.row; i++) {
            for (var j = 0; j < info.col; j++) {
                var li = aLi[i * info.col + j];
                li.left = (iWidth + 3) * j;
                li.top = (iHeight + 3) * i;
            }
        }
    }

    /*拖拽*/
    function setMove() {
        aLi.forEach(function(li, index) {
            drag({
                el: li
                , start: function() {
                    small.isCollision = false;
                    small.target = {'left': css(li, 'left'),'top': css(li, 'top')};
                    css(li, 'zIndex', zIndex++);
                }
                , limit: function(now) {
                    var rect = oList.getBoundingClientRect();
                    var minL = - rect.left;
                    var maxL = window.innerWidth - rect.left - li.offsetWidth;
                    var minT = - rect.top;
                    var maxT = window.innerHeight - rect.top - li.offsetHeight;
                    if (now.x < minL) {
                        now.x = minL;
                    } else if (now.x > maxL) {
                        now.x = maxL;
                    }
                    if (now.y < minT) {
                        now.y = minT;
                    } else if (now.y > maxT) {
                        now.y = maxT;
                    }
                }
                , move: function() {
                    small.isCollision = false;
                    var arr = [];
                    aLi.forEach(function(target) {
                        if (target != li && collision(li, target)) {
                            arr.push(target);
                        }
                    });
                    if (small.li) {
                        small.li.className = '';
                    }
                    if (arr.length == 0) {
                        return;
                    }
                    small.isCollision = true;
                    small.li = arr[0];
                    small.dis = getCircleDis(li, small.li);
                    for (var i = 0; i < arr.length; i++) {
                        var dis = getCircleDis(li, arr[i]);
                        if (dis < small.dis) {
                            small.dis = dis;
                            small.li = arr[i];
                        }
                    }
                    small.origin = {'left': css(small.li, 'left'),'top': css(small.li, 'top')};
                    small.li.className = 'active';
                }
                , end: function() {
                    if (small.isCollision) {
                        startMove(small.li, small.target, 200, 'linear', function() {
                            small.li.className = '';
                            oNum.innerHTML = ++info.num;
                            setTimeout(function() {
                                toScuess();
                            }, 10);
                        });
                        startMove(li, small.origin, 200, 'linear');
                    } else {
                        startMove(li, small.target, 200, 'linear');
                    }
                }
            });
        });
    }

    /*清空数据*/
    function clear() {
        info.time = 0;
        info.num = 0;
        oTime.innerHTML = 0;
        oNum.innerHTML = 0;
        clearInterval(oTime.timer);
    }

    /*启动时间*/
    function startTime() {
        clear();
        oTime.timer = setInterval( function() {
            oTime.innerHTML = ++info.time;
        }, 1000);
    }

    /*判定是否成功*/
    function toScuess() {
        for (var i = 0; i < aLi.length; i++) {
            if (aLi[i].left != css(aLi[i], 'left') || aLi[i].top != css(aLi[i], 'top')) {
                return;
            }
        }
        alert('第' + info.level + '关成功！！' );
        oStart.value = '开始游戏';
        oStart.removeEventListener('click', start);
        oRestart.removeEventListener('click', restart);
        setLevel(++info.level);
    }

})();


/*元素拖拽事件*/
function drag(init) {
    var el = init.el;
    var startMouse;
    var startEl;
    el.addEventListener('mousedown', function(ev) {
        startMouse = {
            x: ev.clientX,
            y: ev.clientY
        }
        startEl = {
            x: css(el, 'left'),
            y: css(el, 'top')
        }
        init.start && init.start();
        document.addEventListener('mousemove', move);
        document.addEventListener('mouseup', up);
        ev.preventDefault();
    });
    function move(ev) {
        var now = {
            x: startEl.x + ev.clientX - startMouse.x,
            y: startEl.y + ev.clientY - startMouse.y
        }
        init.limit && init.limit(now);
        css(el, 'left', now.x);
        css(el, 'top', now.y);
        init.move && init.move();
    }
    function up() {
        document.removeEventListener('mousemove', move);
        document.removeEventListener('mouseup', up);
        init.end && init.end();
    }
}

/*碰撞检测*/
function collision(start, target){
    var rect = start.getBoundingClientRect();
    var rect2 = target.getBoundingClientRect();
    if (rect.left > rect2.right
        || rect.right < rect2.left
        || rect.top > rect2.bottom
        || rect.bottom < rect2.top) {
        return false;
    }
    return true;
}

/*检测两个元素中心点距离*/
function getCircleDis(start, target) {
    var rect = start.getBoundingClientRect();
    var rect2 = target.getBoundingClientRect();

    var circle = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
    }
    var circle2 = {
        x: rect2.left + rect2.width / 2,
        y: rect2.top + rect2.height / 2
    }
    var dis = Math.pow(circle.x - circle2.x, 2) +Math.pow(circle.y - circle2.y, 2);
    return Math.sqrt(dis);
}