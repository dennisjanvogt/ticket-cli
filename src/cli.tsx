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
  case '--help':
  case '-h':
    console.log(`Usage: ticket [command]

Commands:
  (none)          Open interactive TUI board
  add "title"     Create ticket [--desc "..."] [--column todo] [--priority medium] [--tag bug]
  move <id> <col> Move ticket to column (backlog|todo|in-progress|done)
  list            List tickets [--column todo] [--json]
  view <id>       View ticket details
  edit <id>       Edit ticket [--title "..."] [--desc "..."] [--priority ...] [--column ...]
  delete <id>     Delete ticket
  board           Static board print`);
    break;
  default:
    // No command or unknown → open TUI
    render(React.createElement(App));
    break;
}
