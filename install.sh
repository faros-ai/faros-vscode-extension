#!/bin/bash
set -e

user="${SUDO_USER:-$(stat -f '%Su' /dev/console)}"
if [[ -z "$user" || "$user" == "root" ]]; then
  echo "Unable to determine the target user for Faros extension configuration" >&2
  exit 1
fi

extension_config_file_path="/Users/${user}/.vscode/extensions/farosai"
extension_config_file_name=".config.json"

# Create extension config file if it doesn't exist
sudo -u "$user" mkdir -m 700 -p "$extension_config_file_path"
chmod 700 "$extension_config_file_path"
chown "$user" "$extension_config_file_path"
sudo -u "$user" touch "$extension_config_file_path/$extension_config_file_name"
chmod 600 "$extension_config_file_path/$extension_config_file_name"
cat > "$extension_config_file_path/$extension_config_file_name" << EOF
{
  "webhook": "https://ap.prod.workflows.faros.ai/api/v1/webhooks/...",
  "webhookSecret": "<webhook-secret>"
}
EOF
chown "$user" "$extension_config_file_path/$extension_config_file_name"

# Uninstall legacyextension
sudo -u "$user" /usr/local/bin/code --uninstall-extension undefined_publisher.faros-vscode-extension || true
sudo -u "$user" /usr/local/bin/cursor --uninstall-extension undefined_publisher.faros-vscode-extension || true

# Install marketplace extension
sudo -u "$user" /usr/local/bin/code --install-extension FarosAI.faros-vscode-extension || true
sudo -u "$user" /usr/local/bin/cursor --install-extension FarosAI.faros-vscode-extension || true

# Update extensions
sudo -u "$user" /usr/local/bin/code --update-extensions || true
sudo -u "$user" /usr/local/bin/cursor --update-extensions || true
