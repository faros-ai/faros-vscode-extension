curl -L -O https://github.com/faros-ai/faros-vscode-extension/releases/latest/download/faros-vscode-extension.vsix
if command -v /usr/local/bin/cursor &> /dev/null
then
    /usr/local/bin/cursor --install-extension faros-vscode-extension.vsix
else
   /usr/local/bin/code --install-extension faros-vscode-extension.vsix
fi

