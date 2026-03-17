import { render } from 'ink';
import React from 'react';
import { Platform } from './tui/Platform.js';
import { setProjectOverride } from './store.js';
import { cmdAdd } from './commands/add.js';
import { cmdMove } from './commands/move.js';
import { cmdList } from './commands/list.js';
import { cmdView } from './commands/view.js';
import { cmdEdit } from './commands/edit.js';
import { cmdDelete } from './commands/delete.js';
import { cmdBoard } from './commands/board.js';
import { cmdInfo } from './commands/info.js';
import { cmdProjects } from './commands/projects.js';
import { cmdSubtask } from './commands/subtask.js';

const rawArgs = process.argv.slice(2);

// Extract global --project flag before command parsing
let args = [...rawArgs];
const projectIdx = args.indexOf('--project');
if (projectIdx !== -1 && args[projectIdx + 1]) {
  setProjectOverride(args[projectIdx + 1]);
  args.splice(projectIdx, 2);
}

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
  case 'projects':
    cmdProjects(rest);
    break;
  case 'subtask':
    cmdSubtask(rest);
    break;
  case 'info':
  case '--help':
  case '-h':
    cmdInfo();
    break;
  default:
    // No command or unknown → open TUI
    // Enter alternate screen buffer for fullscreen TUI
    process.stdout.write('\x1b[?1049h');
    process.stdout.write('\x1b[H');
    const instance = render(React.createElement(Platform));
    instance.waitUntilExit().then(() => {
      // Restore main screen buffer
      process.stdout.write('\x1b[?1049l');
    });
    break;
}
