import * as vscode from 'vscode';
import { startConversation } from './AiderAgent';

export class AiderAgentWebView {
    public static currentPanel: AiderAgentWebView | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private _disposables: vscode.Disposable[] = [];

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        this._panel = panel;
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        this._panel.webview.html = this._getWebviewContent(this._panel.webview, extensionUri);
        this._setWebviewMessageListener(this._panel.webview);
    }

    public static render(extensionUri: vscode.Uri) {
        if (AiderAgentWebView.currentPanel) {
            AiderAgentWebView.currentPanel._panel.reveal(vscode.ViewColumn.One);
        } else {
            const panel = vscode.window.createWebviewPanel(
                'aiderAgentView',
                'Aider Agent',
                vscode.ViewColumn.One,
                {
                    enableScripts: true,
                    localResourceRoots: [extensionUri]
                }
            );
            AiderAgentWebView.currentPanel = new AiderAgentWebView(panel, extensionUri);
        }
    }

    private _getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri) {
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'src', 'AiderAgent.ts'));
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Aider Agent</title>
            </head>
            <body>
                <button id="startButton">Start Conversation</button>
                <script src="${scriptUri}"></script>
                <script>
                    const vscode = acquireVsCodeApi();
                    document.getElementById('startButton').addEventListener('click', () => {
                        vscode.postMessage({ command: 'startConversation' });
                    });
                </script>
            </body>
            </html>
        `;
    }

    private _setWebviewMessageListener(webview: vscode.Webview) {
        webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'startConversation':
                        startConversation();
                        return;
                }
            },
            undefined,
            this._disposables
        );
    }

    public dispose() {
        AiderAgentWebView.currentPanel = undefined;
        this._panel.dispose();
        while (this._disposables.length) {
            const disposable = this._disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }
}
