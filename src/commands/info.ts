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
  console.log(`  ${chalk.cyan('move')} <id> <column>           Ticket in Spalte verschieben`);
  console.log(`  ${chalk.cyan('list')}                          Alle Tickets auflisten`);
  console.log(`      --column <col>            Nach Spalte filtern`);
  console.log(`      --json                    Ausgabe als JSON`);
  console.log(`  ${chalk.cyan('view')} <id>                    Ticket-Details anzeigen`);
  console.log(`  ${chalk.cyan('edit')} <id>                    Ticket bearbeiten`);
  console.log(`      --title "..."             Titel ändern`);
  console.log(`      --desc "..."              Beschreibung ändern`);
  console.log(`      --priority <prio>         Priorität ändern`);
  console.log(`      --column <col>            Spalte ändern`);
  console.log(`      --tag <name>              Tags setzen (mehrfach verwendbar)`);
  console.log(`  ${chalk.cyan('delete')} <id>                  Ticket löschen`);
  console.log(`  ${chalk.cyan('board')}                         Statischer Board-Print`);
  console.log(`  ${chalk.cyan('projects')}                      Alle Projekte anzeigen`);
  console.log(`  ${chalk.cyan('info')}                          Diese Hilfe anzeigen\n`);

  console.log(chalk.bold('TUI SHORTCUTS'));
  console.log(`  ${chalk.cyan('←→')}    Spalten wechseln        ${chalk.cyan('↑↓')}    Tickets navigieren`);
  console.log(`  ${chalk.cyan('n')}     Neues Ticket             ${chalk.cyan('Enter')} Details ansehen`);
  console.log(`  ${chalk.cyan('m')}     Ticket nach rechts       ${chalk.cyan('d')}     Ticket nach links`);
  console.log(`  ${chalk.cyan('x')}     Ticket löschen           ${chalk.cyan('/')}     Suche`);
  console.log(`  ${chalk.cyan('Esc')}   Zurück / Filter löschen  ${chalk.cyan('q')}     Beenden\n`);

  console.log(chalk.bold('SPALTEN'));
  console.log(`  ${chalk.dim('Backlog')} → ${chalk.blue('Todo')} → ${chalk.yellow('In Progress')} → ${chalk.green('Done')}\n`);

  console.log(chalk.bold('PRIORITÄTEN'));
  console.log(`  ${chalk.red('◆')} critical   ${chalk.yellow('●')} high   ${chalk.blue('○')} medium   ${chalk.dim('·')} low\n`);

  console.log(chalk.bold('SPEICHERUNG'));
  console.log(`  Globale SQLite-Datenbank: ${chalk.dim(getStorePath())}`);
  console.log('  Jedes Verzeichnis wird automatisch als eigenes Projekt erkannt.');
  console.log('  Mit --project <name> kann ein beliebiges Projekt angesprochen werden.\n');

  console.log(chalk.bold('LIVE-UPDATES'));
  console.log('  Das TUI aktualisiert sich automatisch wenn Tickets per CLI');
  console.log('  geändert werden — ideal für die Nutzung mit Claude Code.\n');

  console.log(chalk.bold('BEISPIELE'));
  console.log(chalk.dim('  # Ticket erstellen'));
  console.log('  ticket add "Login implementieren" --priority high --tag feature --column todo');
  console.log(chalk.dim('  # Ticket verschieben'));
  console.log('  ticket move 1 in-progress');
  console.log(chalk.dim('  # Alle Tickets als JSON (für Claude Code)'));
  console.log('  ticket list --json');
  console.log(chalk.dim('  # Board im Terminal anzeigen'));
  console.log('  ticket board');
  console.log(chalk.dim('  # Ticket in anderem Projekt erstellen'));
  console.log('  ticket --project my-api add "Fix auth" --priority critical');
  console.log(chalk.dim('  # Alle Projekte anzeigen'));
  console.log('  ticket projects');
}
