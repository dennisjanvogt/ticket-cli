import chalk from 'chalk';
import { getProject, getStorePath } from '../store.js';

export function cmdInfo(): void {
  const project = getProject();
  console.log(chalk.bold.bgBlue.white(' 📋 Ticket CLI ') + ' — Interaktives Kanban Board im Terminal\n');

  console.log(chalk.bold('AKTUELLES PROJEKT'));
  console.log(`  ${chalk.cyan(project.name)} (${chalk.dim(project.path)})\n`);

  console.log(chalk.bold('USAGE'));
  console.log('  ticket                        TUI öffnen (interaktives Board)');
  console.log('  ticket <command> [options]     Befehl ausführen');
  console.log('  ticket --project <name> ...   Anderes Projekt ansprechen\n');

  console.log(chalk.bold('COMMANDS'));
  console.log(`  ${chalk.cyan('add')} "title"                  Neues Ticket erstellen`);
  console.log(`      --desc "..."              Beschreibung`);
  console.log(`      --column <col>            Spalte (backlog|todo|in-progress|done)`);
  console.log(`      --priority <prio>         Priorität (critical|high|medium|low)`);
  console.log(`      --tag <name>              Tag hinzufügen (mehrfach verwendbar)`);
  console.log(`      --due YYYY-MM-DD          Fälligkeitsdatum`);
  console.log(`  ${chalk.cyan('move')} <id> <column>           Ticket in Spalte verschieben`);
  console.log(`  ${chalk.cyan('list')}                          Alle Tickets auflisten`);
  console.log(`      --column <col>            Nach Spalte filtern`);
  console.log(`      --json                    Ausgabe als JSON`);
  console.log(`  ${chalk.cyan('view')} <id>                    Ticket-Details + Subtasks anzeigen`);
  console.log(`  ${chalk.cyan('edit')} <id>                    Ticket bearbeiten`);
  console.log(`      --title/--desc/--priority/--column/--tag/--due`);
  console.log(`      --due none                Fälligkeitsdatum entfernen`);
  console.log(`  ${chalk.cyan('delete')} <id>                  Ticket löschen`);
  console.log(`  ${chalk.cyan('board')}                         Statischer Board-Print`);
  console.log(`  ${chalk.cyan('subtask')} add <id> "title"     Subtask hinzufügen`);
  console.log(`  ${chalk.cyan('subtask')} toggle <subtask_id>  Subtask abhaken/aufhaken`);
  console.log(`  ${chalk.cyan('subtask')} rm <subtask_id>      Subtask löschen`);
  console.log(`  ${chalk.cyan('subtask')} list <id>            Subtasks anzeigen`);
  console.log(`  ${chalk.cyan('projects')}                      Alle Projekte anzeigen`);
  console.log(`  ${chalk.cyan('info')}                          Diese Hilfe anzeigen\n`);

  console.log(chalk.bold('TUI SHORTCUTS'));
  console.log(`  ${chalk.cyan('←→')}    Spalten wechseln        ${chalk.cyan('↑↓')}    Tickets navigieren`);
  console.log(`  ${chalk.cyan('n')}     Neues Ticket             ${chalk.cyan('Enter')} Details öffnen`);
  console.log(`  ${chalk.cyan('m/d')}   Ticket verschieben →/←   ${chalk.cyan('p')}     Priorität cyclen`);
  console.log(`  ${chalk.cyan('e')}     Titel inline editieren   ${chalk.cyan('x')}     Ticket löschen`);
  console.log(`  ${chalk.cyan('/')}     Suche                    ${chalk.cyan('q')}     Beenden`);
  console.log(chalk.bold('\n  In Detail-Ansicht:'));
  console.log(`  ${chalk.cyan('↑↓')}    Subtask navigieren       ${chalk.cyan('t')}     Subtask togglen`);
  console.log(`  ${chalk.cyan('a')}     Subtask hinzufügen       ${chalk.cyan('p')}     Priorität cyclen\n`);

  console.log(chalk.bold('SPEICHERUNG'));
  console.log(`  Globale SQLite-Datenbank: ${chalk.dim(getStorePath())}`);
  console.log('  Jedes Verzeichnis wird automatisch als eigenes Projekt erkannt.\n');

  console.log(chalk.bold('BEISPIELE'));
  console.log(chalk.dim('  # Ticket mit Due Date'));
  console.log('  ticket add "Release v2" --priority high --due 2026-04-01 --column todo');
  console.log(chalk.dim('  # Subtask hinzufügen'));
  console.log('  ticket subtask add 1 "Unit Tests schreiben"');
  console.log(chalk.dim('  # Priorität per CLI ändern'));
  console.log('  ticket edit 1 --priority critical');
  console.log(chalk.dim('  # Anderes Projekt'));
  console.log('  ticket --project my-api add "Fix auth" --priority critical');
}
