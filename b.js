/******************\
|    Tim the MIT   |
|      Beaver      |
| @author Anthony  |
| @version 0.1     |
| @date 2014/12/26 |
| @edit 2014/12/27 |
\******************/

var Beaver = (function() {
    /**********
     * config */
    var sqSize = 250;
    var moveIncr = 150;
    var moveAmt = 0.3*moveIncr/Math.max(
        window.innerWidth, window.innerHeight
    );

    /*************
     * constants */
    var NONE = 0;
    var LEFT = 1;
    var RIGHT = 2;
    var DOWN = 4;
    var DOWNL = DOWN+LEFT;
    var DOWNR = DOWN+RIGHT;
    var UP = 8;
    var UPL = UP+LEFT;
    var UPR = UP+RIGHT;
    var IMG_LOCS = [];
    var IMG_PREF = '//i.imgur.com/';
    IMG_LOCS[NONE] = IMG_PREF+'QLX57LS.png';
    IMG_LOCS[LEFT] = IMG_PREF+'mldzWN6.png';
    IMG_LOCS[RIGHT] = IMG_PREF+'ksFAhX2.png';
    IMG_LOCS[DOWN] = IMG_PREF+'qd5i9Mq.png';
    IMG_LOCS[DOWNL] = IMG_PREF+'miCMGOW.png';
    IMG_LOCS[DOWNR] = IMG_PREF+'imFoLIM.png';
    IMG_LOCS[UP] = IMG_PREF+'o1yeqBU.png';
    IMG_LOCS[UPL] = IMG_PREF+'4qCrJIB.png';
    IMG_LOCS[UPR] = IMG_PREF+'pNbLGEz.png';
    var nodeMapping = [];
    nodeMapping[NONE] = 4;
    nodeMapping[LEFT] = 3;
    nodeMapping[RIGHT] = 5;
    nodeMapping[DOWN] = 7;
    nodeMapping[DOWNL] = 6;
    nodeMapping[DOWNR] = 8;
    nodeMapping[UP] = 1;
    nodeMapping[UPL] = 0;
    nodeMapping[UPR] = 2;

    /*********************
     * working variables */
    var pos;
    var keys;
    var tim, timInstr;
    var vel;
    var timer;
    var keyDownFun, keyUpFun;

    /******************
     * work functions */
    function initTimBeaver() {
        function beginUserControl() {
            //add the footer with instructions (and a cancel button)
            timInstr = document.createElement('div');
            timInstr.style.position = 'fixed';
            timInstr.style.left = '1em';
            timInstr.style.bottom = '1em';
            timInstr.style.fontFamily = 'Monospace';
            timInstr.style.fontSize = '1.5em';
            timInstr.style.backgroundColor = 'rgba(95, 140, 31, 0.3)';
            timInstr.style.padding = '0.5em';
            timInstr.style.borderBottomLeftRadius = '0.5em';
            timInstr.style.borderBottomRightRadius = '0.5em';
            timInstr.style.borderTop = '0.5em solid rgba(95, 140, 31, 1)';
            timInstr.id = 'tim-instr';
            timInstr.innerHTML = '<div style="float: left;'+
                    'background-color: rgba(95, 140, 31, 0.83);'+
                    'margin-bottom: 0.5em; padding: 0.25em;'+
                    'border-radius: 0.25em; color: white;">'+
                    '<div>w or &uarr; - up</div>'+
                    '<div>a or &larr; - left</div>'+
                    '<div>s or &darr; - down</div>'+
                    '<div>d or &rarr; - right</div>'+
                '</div>'+
                '<div style="float: right;">'+
                    '<iframe src="http://ghbtns.com/github-btn.html?'+
                            'user=turbomaze&repo=movable-tim-beaver&type=fork" '+
                            'allowtransparency="true" frameborder="0" '+
                            'scrolling="0" width="62" height="20"'+
                            'style="margin-top: 4px;">'+
                    '</iframe>'+
                '</div>'+
                '<hr style="clear: both; margin-bottom: 0.5em;">'+
                '<a id="tim-off-btn" '+
                   'style="color: #0063A2; cursor: pointer">'+
                    'Get outa my face, Tim!'+
                '</a><br>';
            document.getElementsByTagName('body')[0].appendChild(
                timInstr
            );

            document.getElementById('tim-off-btn').addEventListener(
                'click',
                function() {
                    document.removeEventListener('keydown', keyDownFun);
                    document.removeEventListener('keyup', keyUpFun);
                    document.getElementsByTagName('body')[0].removeChild(
                        tim
                    );
                    document.getElementsByTagName('body')[0].removeChild(
                        timInstr
                    );
                }
            );

            keyDownFun = function(e) {
                if (!keys[e.keyCode]) { //isn't already pressed
                    keys[e.keyCode] = true; //recognize the press
                    clearInterval(timer); //get rid of the old timer
                    
                    var moveCmd = getMoveCmd();
                    updateVel(moveCmd);
                    obeyCommand(moveCmd); //since it's a keydown event
                    if (moveCmd === NONE) return; //no point repeating

                    //continue to move
                    timer = setInterval(function() {
                        obeyCommand(moveCmd);
                    }, moveIncr);
                }
            };
            document.addEventListener('keydown', keyDownFun);
            keyUpFun = function(e) {
                keys[e.keyCode] = false;
                clearInterval(timer); //get rid of the old timer
                
                var moveCmd = getMoveCmd();
                updateVel(moveCmd);
                if (moveCmd === NONE) return;

                //move according to the new direction
                timer = setInterval(function() {
                    obeyCommand(moveCmd);
                }, moveIncr);
            };
            document.addEventListener('keyup', keyUpFun);
        } //enables the user to control tim

        //init misc working vars
        pos = [0, 0];
        keys = [];
                 /* 9 8 10 */
        vel = 0; /* 1 0  2 */
                 /* 3 4  6 */

        //init tim
        tim = document.createElement('img');
        tim.width = sqSize;
        tim.height = sqSize;
        tim.style.position = 'fixed';
        tim.src = IMG_LOCS[vel];
        moveTim(pos);
        document.getElementsByTagName('body')[0].appendChild(tim);

        //deal with window resizing
        window.addEventListener('resize', function() {
            moveTim(pos);
            moveAmt = 0.3*moveIncr/Math.max(
                window.innerWidth, window.innerHeight
            );
        });

        //move according to a plan, giving the user control when finished
        var moves = [
            2,2,2,2,2,2,2,2,2,2,2,2,2,2,6,6,6,6,4,4,4,4,
            4,4,4,5,5,5,5,1,1,1,1,1,1,1,1,1,1,9,8,8,8,8,
            8,8,10,10,2,2,2,2,2,2,6,6,6,4,4,4,5,5,1,1,1
        ];
        for (var ai = 0; ai < moves.length; ai++) {
            setTimeout((function(moveCmd, lastOne) {
                return function() {
                    updateVel(moveCmd);
                    obeyCommand(moveCmd);

                    if (lastOne) beginUserControl();
                };
            })(moves[ai], ai === moves.length-1), moveIncr*ai);
        }
    }

    function getMoveCmd() {
        var moveCmd = 0;
        if (keys[87] || keys[38]) moveCmd += UP;
        if (keys[65] || keys[37]) moveCmd += LEFT;
        if (keys[83] || keys[40]) moveCmd += DOWN;
        if (keys[68] || keys[39]) moveCmd += RIGHT;

        if ((keys[65] || keys[37]) && (keys[68] || keys[39])) {
            moveCmd -= LEFT+RIGHT; //they cancel each other out
        }
        if ((keys[87] || keys[38]) && (keys[83] || keys[40])) {
            moveCmd -= UP+DOWN; //they cancel each other out
        }

        return moveCmd;
    }

    function updateVel(cmd) {
        //given a start velocity and end velocity, this function returns
        //a list of intermediary velocities to smoothly transition the images
        function getPlan(start, end) {
            /* Nodes and edges where nodes are velocity directions
             * 0 -- 1 -- 2
             * |         |
             * 3    4    5
             * |    |    |
             * 6 -- 7 -- 8
             */
            var graph = [
        /* 0 */ [1, 3],
        /* 1 */ [0, 2],
        /* 2 */ [1, 5],
        /* 3 */ [0, 6],
        /* 4 */ [7],
        /* 5 */ [2, 8],
        /* 6 */ [3, 7],
        /* 7 */ [4, 6, 8],
        /* 8 */ [5, 7]
            ]; //edges for each node
            var visited = []; //nodes you've already seen
            var paths = [[start]]; //plausible paths
            var solution = [];
            //iterate potential paths; guaranteed to terminate
            while (paths.length >= 1) {
                var path = paths.shift(); //take the current path
                var idx = path[path.length-1]; //look at its most recent node
                //look at the most recent node's connections
                var conns = graph[idx];
                for (var ni = 0; ni < conns.length; ni++) {
                    //if you've found the goal node
                    if (conns[ni] === end) {
                        //then you're done!!!
                        solution = path.concat(conns[ni]);
                        paths = [];
                        break;
                    } else if (visited.indexOf(conns[ni]) === -1) {
                        //add all nodes you haven't seen before to the stack
                        paths.push(path.concat(conns[ni]));
                        visited.push(conns[ni]);
                    }
                }
            }

            var transitions = [
                [ -1, UP,  -1, LEFT,   -1,    -1,    -1,   -1,    -1],
                [UPL, -1, UPR,   -1,   -1,    -1,    -1,   -1,    -1],
                [ -1, UP,  -1,   -1,   -1, RIGHT,    -1,   -1,    -1],
                [UPL, -1,  -1,   -1, NONE,    -1, DOWNL,   -1,    -1],
                [ -1, -1,  -1, LEFT,   -1, RIGHT,    -1, DOWN,    -1],
                [ -1, -1, UPR,   -1, NONE,    -1,    -1,   -1, DOWNR],
                [ -1, -1,  -1, LEFT,   -1,    -1,    -1, DOWN,    -1],
                [ -1, -1,  -1,   -1, NONE,    -1, DOWNL,   -1, DOWNR],
                [ -1, -1,  -1,   -1,   -1, RIGHT,    -1, DOWN,    -1]
            ]; //what velocities get you from idx1 to idx2?

            //come up with a plan based on the path
            var plan = [];
            for (var si = 0; si < solution.length-1; si++) {
                plan.push(transitions[solution[si]][solution[si+1]]);
            }
            return plan;
        }

        //update the velocity
        var oldVel = vel;
        vel = cmd;

        //update the picture if the velocity changed
        if (oldVel !== vel) {
            var mapping = [];
            var plan = getPlan(
                nodeMapping[oldVel], nodeMapping[vel]
            ); //how will you transition smoothly?
            updateImgSeq(plan, 1.5*moveIncr/plan.length);
        }
    }

    function updateImgSeq(seq, incr, origLength) {
        for (var ai = 0; ai < seq.length; ai++) {
            setTimeout((function(imgLoc) {
                return function() {
                    tim.src = imgLoc;
                };
            })(IMG_LOCS[seq[ai]]), incr*ai);
        }
    }

    function obeyCommand(cmd) {
        if (cmd >= 8) {
            pos[1] -= moveAmt; //up
            cmd -= 8;
        }
        if (cmd >= 4) {
            pos[1] += moveAmt; //down
            cmd -= 4;
        }
        if (cmd >= 2) {
            pos[0] += moveAmt; //right
            cmd -= 2;
        }
        if (cmd >= 1) {
            pos[0] -= moveAmt; //left
            cmd -= 1;
        }
        pos[0] = Math.max(0, Math.min(1, pos[0])); //keep it between 0 and 1
        pos[1] = Math.max(0, Math.min(1, pos[1]));

        moveTim(pos);
    }

    function moveTim(loc) {
        pos = [loc[0], loc[1]];
        tim.style.left = (window.innerWidth-sqSize)*pos[0]+'px';
        tim.style.top = (window.innerHeight-sqSize)*pos[1]+'px';
    }

    return {
        init: initTimBeaver
    };
})();

window.addEventListener('load', Beaver.init);