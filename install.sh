# Function to uninstall extension
uninstall_legacy_extension() {
    local cmd=$1
    if $cmd --list-extensions | grep -q "undefined_publisher.faros-vscode-extension"; then
        echo "Uninstalling Faros legacy extension from $cmd..."
        $cmd --uninstall-extension undefined_publisher.faros-vscode-extension
    else
        echo "Faros legacy extension not found in $cmd."
    fi
}

# VSCode
if command -v /usr/local/bin/code &> /dev/null; then
    uninstall_legacy_extension "/usr/local/bin/code"
    echo "Installing official Faros extension..."
    /usr/local/bin/code --install-extension FarosAI.faros-vscode-extension
    echo "Updating extensions..."
    /usr/local/bin/code --update-extensions
else
    echo "VSCode not found."
fi

# Cursor
if command -v /usr/local/bin/cursor &> /dev/null; then
    uninstall_legacy_extension "/usr/local/bin/cursor"
    echo "Installing official Faros extension..."
    /usr/local/bin/cursor --install-extension FarosAI.faros-vscode-extension
    echo "Updating extensions..."
    /usr/local/bin/cursor --update-extensions
else
    echo "Cursor not found."
fi