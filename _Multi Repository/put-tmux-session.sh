# If not exists, create a tmux session named "dev"
tmux new-session -d -s dev || true
# Attach to the tmux session named "dev"
tmux attach-session -t dev
