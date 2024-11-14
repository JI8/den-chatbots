import * as fs from 'fs';
import * as path from 'path';

interface FileTree {
    name: string;
    path: string;
    type: 'file' | 'directory';
    children?: FileTree[];
}

function createFileTree(
    dirPath: string, 
    ignorePaths: string[] = ['node_modules', '.git', '.next']
): FileTree {
    const name = path.basename(dirPath);
    
    // Check if this path should be ignored
    if (ignorePaths.includes(name)) {
        return {
            name,
            path: dirPath,
            type: 'directory',
            children: []
        };
    }

    const stats = fs.statSync(dirPath);
    
    if (stats.isFile()) {
        return { 
            name, 
            path: dirPath,
            type: 'file' 
        };
    }
    
    const children = fs.readdirSync(dirPath)
        .map(child => createFileTree(path.join(dirPath, child), ignorePaths));
    
    return {
        name,
        path: dirPath,
        type: 'directory',
        children
    };
}

function printFileTree(tree: FileTree, indent: string = ''): void {
    const icon = tree.type === 'directory' ? '📁' : '📄';
    console.log(`${indent}${icon} ${tree.name}`);
    
    if (tree.children) {
        tree.children.forEach(child => {
            printFileTree(child, indent + '  ');
        });
    }
}

// Usage example:
const projectRoot = './';
const fileTree = createFileTree(projectRoot);
printFileTree(fileTree);

// If you still want the JSON output:
// console.log(JSON.stringify(fileTree, null, 2)); 