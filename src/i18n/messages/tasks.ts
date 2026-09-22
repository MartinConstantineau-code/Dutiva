import { defineMessages } from '../core'

/**
 * Tasks view — UI-chrome strings ported from `App v2.dc.html`
 * (`buildTasksView()` inline `L(en, fr)` pairs + `buildI18n()` tasks_empty*).
 * FR strings with no source in the prototype are marked [FR self-authored].
 *
 * NOTE: registered in src/i18n/messages/index.ts by the integration owner.
 * The view resolves these via `useI18n().x(tasksMessages.key)`.
 */
export const tasksMessages = defineMessages({
  /* Header count — "{n} open" (buildTasksView openLabel). */
  tasks_open_label: { en: 'open', fr: 'ouvertes' },

  /* Row meta line (buildTasksView ownerLbl / linkedLbl). */
  tasks_owner: { en: 'Owner', fr: 'Responsable' },
  tasks_linked_prefix: { en: 'Linked: ', fr: 'Lié : ' },

  /* Status chip (buildTasksView statusLabel). */
  tasks_status_done: { en: 'Done', fr: 'Terminé' },
  tasks_status_blocked: { en: 'Blocked', fr: 'Bloqué' },
  tasks_status_open: { en: 'Open', fr: 'Ouvert' },

  /* Empty state (buildI18n tasks_empty / tasks_empty_sub). */
  tasks_empty: { en: 'You’re all caught up.', fr: 'Vous êtes à jour.' },
  tasks_empty_sub: {
    en: 'New tasks from Advisor will appear here.',
    fr: 'Les nouvelles tâches du Conseiller apparaîtront ici.',
  },

  /* A11y labels (prototype markup aria-labels; EN verbatim). */
  tasks_toggle_aria: {
    en: 'Toggle task done',
    fr: 'Basculer l’état de la tâche', // [FR self-authored]
  },
  tasks_open_chat_aria: {
    en: 'Open linked conversation for {title}',
    fr: 'Ouvrir la conversation liée pour {title}', // [FR self-authored]
  },

  /* ── Production tasks (real persistence — no design-handoff counterpart;
     [FR self-authored] throughout) ───────────────────────────────────────── */
  tasks_prod_add: { en: 'Add task', fr: 'Ajouter une tâche' },
  tasks_prod_cancel: { en: 'Cancel', fr: 'Annuler' },
  tasks_prod_title_label: { en: 'Task', fr: 'Tâche' },
  tasks_prod_priority: { en: 'Priority', fr: 'Priorité' },
  tasks_prod_due: { en: 'Due date', fr: 'Échéance' },
  tasks_prod_save: { en: 'Save task', fr: 'Enregistrer la tâche' },
  tasks_prod_count_open: { en: 'open', fr: 'ouvertes' },
  tasks_prod_loading: { en: 'Loading…', fr: 'Chargement…' },
  tasks_prod_empty_title: { en: 'No tasks yet', fr: 'Aucune tâche pour l’instant' },
  tasks_prod_empty_body: {
    en: 'Add your first task to start tracking real work.',
    fr: 'Ajoutez votre première tâche pour commencer à suivre le travail réel.',
  },
  tasks_prod_error: { en: 'Couldn’t load tasks.', fr: 'Impossible de charger les tâches.' },
  tasks_prod_retry: { en: 'Retry', fr: 'Réessayer' },
  tasks_prod_added: { en: 'Task added', fr: 'Tâche ajoutée' },
  tasks_prod_add_failed: {
    en: 'Couldn’t add the task. Try again.',
    fr: 'Impossible d’ajouter la tâche. Réessayez.',
  },
  tasks_prod_remove: { en: 'Remove', fr: 'Retirer' },
  tasks_prod_removed: { en: 'Task removed', fr: 'Tâche retirée' },
  tasks_prod_remove_failed: {
    en: 'Couldn’t remove the task.',
    fr: 'Impossible de retirer la tâche.',
  },
  tasks_prod_toggle_failed: {
    en: 'Couldn’t update the task.',
    fr: 'Impossible de mettre à jour la tâche.',
  },
  tasks_prod_priority_low: { en: 'Low', fr: 'Faible' },
  tasks_prod_priority_medium: { en: 'Medium', fr: 'Moyenne' },
  tasks_prod_priority_high: { en: 'High', fr: 'Élevée' },
  tasks_prod_priority_critical: { en: 'Critical', fr: 'Critique' },
})
