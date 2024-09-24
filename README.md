# Faros AI VSCode Extension
Faros AI VSCode Extension is a powerful tool designed to bring real-time observability into your engineering workflows. With this extension, engineering teams can gain deep insights into the inner loop of software development, enabling data-driven decision-making and performance optimization.

# About Faros AI
Faros AI is a comprehensive observability platform built for engineering teams. Our platform provides solutions across a wide range of areas, including:

 - Engineering Productivity
 - DORA Metrics
 - Developer Experience
 - AI Copilot Impact
 - Software Quality
 - Initiative Tracking
 - Investment Strategy
 - Software Capitalization
 - Team Health & Onboarding

Faros AI offers out-of-the-box intelligence modules, delivering rapid visibility into productivity, delivery outcomes, budgets, and talent without requiring any data refactoring or standardization. Users can create custom metrics, dashboards, and reports to support both operational cadences and ad hoc business analysis.

# What Does the VSCode Extension Do?
This VSCode extension enhances the Faros AI platform by collecting valuable data from within your developers' IDEs. Installing the extension allows Faros AI customers to:

- Gain insights into key contributors to developer performance.
- Understand the inner workings of development processes.
- Optimize engineering practices by analyzing data directly from developer environments.

# Key Feature: Auto-Completion Event Tracking
The first major feature of the Faros AI VSCode extension focuses on tracking auto-completion events. This data helps engineering organizations assess the adoption and impact of coding assistants, such as GitHub Copilot.

By deploying this extension to your engineers' machines, Faros will collect data on how often and how effectively auto-completion suggestions are used, offering valuable insights into how these tools are improving productivity and coding speed.

# Installation and Setup
Download and install the Faros AI VSCode Extension from [the Visual Studio Code Marketplace](https://marketplace.visualstudio.com/items?itemName=FarosAI.faros-vscode-extension) and then configure the extension:
* Open VSCode setting screen by hitting cmd+,
* Enter 'Faros' in the search bar to get to Faros AI's extension settings
* Enter your personal details in the `Vcs Name`, `Vcs Email`, and `Vcs Uid` fields
* Configure how the extension will send data to Faros in one of two ways:
  - Set a dedicated webhook url (see more on how to configure a webhook below)
  - Set Faros API Key that the extension will use to directly post requests to Faros API

Once installed, the extension will automatically begin collecting auto-completion event data.

## Setting up a dedicated webhook
In Faros' workflows screen (Data control -> Workflows) create a new flow by importing [this](https://github.com/faros-ai/faros-vscode-extension/blob/3e24a2e263c26f6dc9c63c9d9155eb5845a66060/activepieces-flow.json) template json file. 
Once imported, edit the `Send HTTP request` step and update its `authorization` header's value to be your Faros API key. Publish your flow and use its `Catch Webhook` live URL in your extension's webhook configuration.

# How It Works
Once installed, the VSCode extension integrates seamlessly with your developers' workflow. Auto-completion events are captured and securely sent to the Faros AI platform, where leaders can analyze the data to make informed decisions about engineering performance and tool adoption.

# Privacy & Security
Faros AI takes data privacy and security seriously. All data collected through this extension is anonymized and encrypted, ensuring that no personal or sensitive information is exposed. For more details, please review our [privacy policy](https://faros.ai/privacy-policy/).

# Support
If you have any questions or need support, please reach out to our team at support@faros.ai or visit our documentation for more details.

# Contributing
We welcome contributions from the community! If you're interested in improving this extension, please feel free to submit a pull request or open an issue on our [GitHub repository](https://github.com/faros-ai/faros-vscode-extension).
