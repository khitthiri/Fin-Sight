export const formatCurrency = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n ?? 0)

export const formatMonth = (str) => {
  const d = new Date(str)
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export const categoryColor = (cat) => {
  const map = {
    Food:          'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    Housing:       'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    Transport:     'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    Entertainment: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    Health:        'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    Shopping:      'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
    Utilities:     'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
    Other:         'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  }
  return map[cat] ?? map.Other
}

export const categoryHex = (cat) => {
  const map = {
    Food: '#f97316', Housing: '#3b82f6', Transport: '#eab308',
    Entertainment: '#a855f7', Health: '#22c55e', Shopping: '#ec4899',
    Utilities: '#06b6d4', Other: '#94a3b8',
  }
  return map[cat] ?? '#94a3b8'
}