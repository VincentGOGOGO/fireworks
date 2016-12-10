/**
 * Created by chengwb on 2016/12/1.
 * 源码网上例子，优化修改
 */
(function (window, $, THREE, undefined) {
    var options = {
        background: {
            color: '#000',
            image: ''
        },
        fireworks: {
            startPoint: {
                fixed: false,
                x: 0,
                y: 0
            },
            endPoint: {},
            radius: {
                fixed: true,//固定还是随机
                min: 1,//固定时的取值，随机最小值
                max: 3
            },
            color: {
                fixed: true,//固定还是随机
                red: {
                    min: 0,//固定时的取值，随机最小值
                    max: 255//随机最大值
                },
                green: {
                    min: 0,
                    max: 255
                },
                blue: {
                    min: 0,
                    max: 255
                }
            }
        },
        fragment: {
            endPoint: {},
            boomArea: {},
            radius: {
                fixed: true,//固定还是随机
                min: 1, //固定时的取值，随机最小值
                max: 2 //随机最大值
            },
            color: {
                style: 'multicolor', //'single','random',单色、彩色、随机（彩、单）
                fixed: false,//固定还是随机
                red: {
                    min: 0,//固定时的取值，随机最小值
                    max: 255//随机最大值
                },
                green: {
                    min: 0,
                    max: 255
                },
                blue: {
                    min: 0,
                    max: 255
                }
            }
        }
    };

    var canvas = document.getElementById("fireworks");
    var context = null;
    var fireworks = [];

    if (canvas.getContext) {
        context = canvas.getContext("2d");
    } else {
        context = null;
        console.log('浏览器不支持canvas');
        return;
    }

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    /**
     * 随机数[a,b)
     * @param start  起始数字
     * @param end    结束数字
     * @returns {*}
     */
    function getRandom(start, end) {
        return start + Math.random() * (end - start);
    }

    //烟花对象
    var Fireworks = function (option) {
        this.fragments = [];
        this.x = option.x || 0;//烟花的位置
        this.y = option.y || (canvas.height + option.radius);
        this.radius = option.radius || 2;//半径
        this.color = option.color || '#fff';//颜色
        this.boomArea = option.boomArea || {x: 0, y: 0};//目的爆炸点
        this.dead = false;
        this.distance = parseInt(getRandom(80, 200));//烟花距离目的爆炸点的距离（用于处理实际爆炸点）
        this.startDisappear = false;
        this.xSpeed = (this.boomArea.x - this.x) * 0.05;
        this.ySpeed = (this.boomArea.y - this.y) * 0.05;
    };
    Fireworks.prototype = {
        paint: function () {//绘制烟花
            context.save();
            context.beginPath();
            context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
            context.fillStyle = this.color;
            context.fill();
            context.restore();
        },
        move: function () {//移动烟花
            var dx = this.boomArea.x - this.x, dy = this.boomArea.y - this.y;
            if (Math.sqrt(dx * dx + dy * dy) <= this.distance) {
                this.boom();
                this.dead = true;
            } else {
                this.x = this.x + this.xSpeed;
                this.y = this.y + this.ySpeed;
                this.paint();
            }
        },
        drawLight: function () {//烟花的光晕
            context.save();
            context.fillStyle = "rgba(255,228,150,0.3)";
            context.beginPath();
            context.arc(this.x, this.y, this.radius + 3 * Math.random() + 1, 0, 2 * Math.PI);
            context.fill();
            context.restore();
        },
        boom: function () {//爆炸
            var fragNum = getRandom(500, 1000);//碎片个数
            var style = getRandom(0, 10) >= 5 ? 'single' : 'multicolor';//颜色风格，单色还是彩色
            var color;
            if (style === 'single') {
                color = {
                    r: parseInt(getRandom(128, 255)),
                    g: parseInt(getRandom(128, 255)),
                    b: parseInt(getRandom(128, 255))
                }
            }

            var range = parseInt(getRandom(100, 250));//爆炸范围
            for (var i = 0; i < fragNum; i++) {
                if (style === 'multicolor') {
                    color = {
                        r: parseInt(getRandom(128, 255)),
                        g: parseInt(getRandom(128, 255)),
                        b: parseInt(getRandom(128, 255))
                    }
                }

                var radian = getRandom(0, 2 * Math.PI);//随机弧度
                var innerR = getRandom(0, range);//碎片运动范围半径
                var x = innerR * Math.cos(radian) + this.x;//碎片运动终点，以爆炸点为圆心
                var y = innerR * Math.sin(radian) + this.y;//
                var radius = getRandom(0, 2);//碎片随机半径
                var fragment = new Fragment({
                    startX: this.x,
                    startY: this.y,
                    radius: radius,
                    color: color,
                    endX: x,
                    endY: y,
                    parent: this
                });

                this.fragments.push(fragment);
            }
        }
    };

    //烟花碎片对象
    var Fragment = function (option) {
        this.parent = option.parent;//所属烟花
        this.endX = option.endX;//运动终点
        this.endY = option.endY;
        this.x = option.startX;//碎片位置
        this.y = option.startY;
        this.dead = false;
        this.boomX = option.startX;//起点
        this.boomY = option.startY;
        this.radius = option.radius;//半径
        this.color = option.color;//颜色
        this.xMoveEnd = false;//是否运动到终点，运动到终点后会有个消失过程，碎片半径逐渐减少到消失不见
    };

    Fragment.prototype = {
        paint: function () {//绘制碎片
            context.save();
            context.beginPath();
            context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
            context.fillStyle = "rgba(" + this.color.r + "," + this.color.g + "," + this.color.b + ",1)";
            context.fill();
            context.restore();
        },
        moveTo: function () {//移动碎片
            this.endY = this.endY + 0.3;//模仿重力，向上运动的减缓运动，向下运动的加速
            var dx = this.endX - this.x, dy = this.endY - this.y;
            this.x = Math.abs(dx) < 0.1 ? this.endX : (this.x + dx * 0.1);
            this.y = Math.abs(dy) < 0.1 ? this.endY : (this.y + dy * 0.1);

            if (dx === 0 && Math.abs(dy) <= 80) {
                this.xMoveEnd = true;//已经运动到终点

                //判断，如果烟花的所有碎片都已经运动到终点则开始让烟花消失
                if (!this.parent.startDisappear && this.parent.fragments.every(function (item, index) {
                        return item.xMoveEnd;
                    })) {
                    this.parent.startDisappear = true;
                }

                //如果烟花开始消失，逐渐减小碎片的半径直到消失
                if (this.parent.startDisappear) {
                    this.radius -= 0.05;
                    if (this.radius <= 0.02) {
                        this.radius = 0;

                        this.dead = true;
                    }
                } else {
                    this.radius -= 0.01;
                    if (this.radius <= 0.02) {
                        this.radius = 0;
                    }
                }
            }

            //绘制碎片
            this.paint();
        }
    };

    var lastTime;
    function animate() {
        context.save();
        context.fillStyle = "rgba(0,5,24,0.1)";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.restore();

        var newTime = new Date();
        if (newTime - lastTime > 1000 + (window.innerHeight - 767) / 2) {
            var x = getRandom(canvas.width / 5, canvas.width * 4 / 5);
            var y = getRandom(50, 200);
            var firework = new Fireworks({
                x: getRandom(canvas.width / 3, canvas.width * 2 / 3),
                y: 0,
                radius: 2,
                color: "#FFF",
                boomArea: {x: x, y: y}
            });
            fireworks.push(firework);

            lastTime = newTime;
            console.log(fireworks)
        }

        //清理爆炸过的烟花
        fireworks = fireworks.filter(function (item, index) {
            return item;
        });

        fireworks.forEach(function (item, index) {
            var that = item;
            if (!item.dead) {
                item.move();
                item.drawLight();
            } else {
                item.fragments.forEach(function (item, index) {
                    if (item && !item.dead) {
                        item.moveTo(index);
                    } else {
                        that.fragments[index] = null;
                    }

                    if (that.fragments.every(function (item, index) {
                            return !item;
                        })) {
                        fireworks[fireworks.indexOf(that)] = null;
                    }
                })
            }
        });

        window.requestAnimationFrame(animate);
    }


    window.fireworks = window.fireworks || {};
    window.fireworks.start = function () {
        lastTime = new Date();
        animate();
    }
})(window, jQuery, THREE);