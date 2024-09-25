import { findWorkingDirectory, activate } from '../extension';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

jest.mock('vscode');
jest.mock('fs');
jest.mock('path');

describe('findWorkingDirectory', () => {
    it('should find the working directory in Windows', async () => {
        const testPath = 'C:\\Users\\user\\Documents\\project\\src\\';
        jest.spyOn(fs, 'statSync').mockReturnValue({} as fs.Stats);
        jest.spyOn(path, 'sep', 'get').mockReturnValue('\\');

        const workingDirectory = await findWorkingDirectory(testPath);
        expect(workingDirectory).toEqual('C:\\Users\\user\\Documents\\project\\src\\');
    });

    it('should find the working directory in Mac', async () => {
        const testPath = '/Users/user/Documents/project/src/';
        jest.spyOn(fs, 'statSync').mockReturnValue({} as fs.Stats);
        jest.spyOn(path, 'sep', 'get').mockReturnValue('/');

        const workingDirectory = await findWorkingDirectory(testPath);
        expect(workingDirectory).toEqual('/Users/user/Documents/project/src/');
    });

    it('should find the .git folder in a workspace', async () => {
        Object.defineProperty(vscode.workspace, 'workspaceFolders', {
            get: jest.fn().mockReturnValue([{
                uri: { fsPath: '/Users/user/Documents/project/src/' },
                name: 'project1',
                index: 0
            }])
        });

        jest.spyOn(fs, 'statSync')
            .mockImplementationOnce(() => { throw new Error('No .git here'); })
            .mockReturnValueOnce({} as fs.Stats);
        jest.spyOn(path, 'sep', 'get').mockReturnValue('/');

        const workingDirectory = await findWorkingDirectory('');
        expect(workingDirectory).toEqual('/Users/user/Documents/project/');
    });
});

describe('activate', () => {
    it('should register commands', () => {
        const context = {
            subscriptions: []
        };

        activate(context as any);

        expect(vscode.commands.registerCommand).toHaveBeenCalledWith('aider.openAiderAgent', expect.any(Function));
        expect(vscode.commands.registerCommand).toHaveBeenCalledWith('aider.add', expect.any(Function));
        expect(vscode.commands.registerCommand).toHaveBeenCalledWith('aider.drop', expect.any(Function));
        expect(vscode.commands.registerCommand).toHaveBeenCalledWith('aider.syncFiles', expect.any(Function));
        expect(vscode.commands.registerCommand).toHaveBeenCalledWith('aider.open', expect.any(Function));
        expect(vscode.commands.registerCommand).toHaveBeenCalledWith('aider.close', expect.any(Function));
    });
});
