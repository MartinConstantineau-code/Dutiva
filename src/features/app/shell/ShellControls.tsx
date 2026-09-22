import { Moon, Sun } from 'lucide-react'
import { useI18n } from '@/i18n/context'
import { useTheme } from '@/lib/themeContext'
import { cx } from './cx'

/**
 * EN/FR segmented pill — prototype `seg()` styling: inset track, 3px padding,
 * active segment lifts onto the surface.
 */
export function LangToggle() {
  const { lang, setLang, t } = useI18n()
  const seg = (active: boolean) =>
    cx(
      'cursor-pointer rounded-[6px] border-none px-[11px] py-[5px] text-[12px] font-semibold',
      'transition-[background,color] duration-150',
      active ? 'bg-surface text-text' : 'bg-transparent text-text-muted',
    )
  return (
    <div className="flex items-center gap-[2px] rounded-[8px] bg-inset p-[3px]">
      <button
        type="button"
        onClick={() => setLang('en')}
        aria-label={t('lang_en_aria')}
        aria-pressed={lang === 'en'}
        className={seg(lang === 'en')}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang('fr')}
        aria-label={t('lang_fr_aria')}
        aria-pressed={lang === 'fr'}
        className={seg(lang === 'fr')}
      >
        FR
      </button>
    </div>
  )
}

/**
 * Theme toggle — shows the sun while dark and the moon while light, matching
 * the prototype (`themeIsDark` → sun, `themeIsLight` → moon).
 */
export function ThemeToggle({
  className,
  iconSize,
}: {
  readonly className: string
  readonly iconSize: number
}) {
  const { theme, toggleTheme } = useTheme()
  const { t } = useI18n()
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={t('theme_toggle_aria')}
      className={className}
    >
      {theme === 'dark' ? (
        <Sun size={iconSize} strokeWidth={1.7} />
      ) : (
        <Moon size={iconSize} strokeWidth={1.7} />
      )}
    </button>
  )
}
