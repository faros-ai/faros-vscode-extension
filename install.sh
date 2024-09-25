#!/bin/bash
user=$(dscl . list /Users | grep -v '_' | grep -v 'ripplingadmin' | grep -v 'nobody' | grep -v 'root' | grep -v 'daemon')
extension_config_file_path="/Users/$user/.vscode/extensions/farosai"
extension_config_file_name=".config.json"

# Create extension config file if it doesn't exist
sudo -u $user mkdir -m 755 -p $extension_config_file_path
sudo -u $user touch "$extension_config_file_path/$extension_config_file_name"
cat > "$extension_config_file_path/$extension_config_file_name" << EOF
{
  "webhook": "https://ap.prod.workflows.faros.ai/api/v1/webhooks/..."
}
EOF

# Uninstall legacyextension
sudo -u $user /usr/local/bin/code --uninstall-extension undefined_publisher.faros-vscode-extension || true
sudo -u $user /usr/local/bin/cursor --uninstall-extension undefined_publisher.faros-vscode-extension || true

# Install marketplace extension
sudo -u $user /usr/local/bin/code --install-extension FarosAI.faros-vscode-extension || true
sudo -u $user /usr/local/bin/cursor --install-extension FarosAI.faros-vscode-extension || true

# Update extensions
sudo -u $user /usr/local/bin/code --update-extensions || true
sudo -u $user /usr/local/bin/cursor --update-extensions || true
