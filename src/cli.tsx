import { parseArgs } from 'node:util';
import { render } from 'ink';
import React from 'react';
import { App } from './tui/App.js';
import { cmdAdd } from './commands/add.js';
import { cmdMove } from './commands/move.js';
import { cmdList } from './commands/list.js';
import { cmdView } from './commands/view.js';
import { cmdEdit } from './commands/edit.js';
import { cmdDelete } from './commands/delete.js';
import { cmdBoard } from './commands/board.js';
import { cmdInfo } from './commands/info.js';

const args = process.argv.slice(2);
const command = args[0];
const rest = args.slice(1);

switch (command) {
  case 'add':
    cmdAdd(rest);
    break;
  case 'move':
    cmdMove(rest);
    break;
  case 'list':
    cmdList(rest);
    break;
  case 'view':
    cmdView(rest);
    break;
  case 'edit':
    cmdEdit(rest);
    break;
  case 'delete':
    cmdDelete(rest);
    break;
  case 'board':
    cmdBoard();
    break;
  case 'info':
  case '--help':
  case '-h':
    cmdInfo();
    break;
  default:
    // No command or unknown → open TUI
    render(React.createElement(App));
    break;
}
