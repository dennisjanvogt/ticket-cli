import chalk from 'chalk';
import { listProjects, getProject } from '../store.js';

export function cmdProjects(args: string[]): void {
  const json = args.includes('--json');
  const projects = listProjects();
  const current = getProject();

  if (json) {
    console.log(JSON.stringify(projects, null, 2));
    return;
  }

  if (projects.length === 0) {
    console.log('No projects found.');
    return;
  }

  console.log(chalk.bold('Projects:\n'));
  for (const p of projects) {
    const marker = p.id === current.id ? chalk.cyan('▸ ') : '  ';
    const ticketCount = ''; // could query but keep it simple
    console.log(`${marker}${chalk.bold(p.name)}`);
    console.log(`    ${chalk.dim(p.path)}`);
  }
  console.log(chalk.dim(`\n${projects.length} project(s) · current: ${current.name}`));
}
