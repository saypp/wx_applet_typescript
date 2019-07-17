#!/bin/bash
#if [ command -v tmux -V >/dev/null 2>&1 ];then
#    echo ""
#else
#    echo "Please install `tmux` using brew|port|apt|yum for best develop experience."
#fi

sessionName="mall-wxapp"

tmux has-session -t $sessionName
hasSession=$?

if [ "$hasSession" = "0" ];then
    tmux attach -t $sessionName
    exit 0
fi


echo "Starting dev session for $sessionName"

tmux new-session -d -s $sessionName -n "compile" ". utils/env;bash"
t=$sessionName:"compile"
tmux split-window -vb -t $t "trap '' 2;tsc -w;bash"
tmux split-window -h -t $t "trap '' 2;gulp;bash"
tmux select-pane -D -t $t

tmux attach -t $sessionName
