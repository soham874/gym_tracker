const LBS_PER_KG = 2.20462

export function kgToLbs(kg) {
  return +(kg * LBS_PER_KG).toFixed(2)
}

export function lbsToKg(lbs) {
  return +(lbs / LBS_PER_KG).toFixed(2)
}

export function convertWeight(valueKg, unit) {
  if (unit === 'lbs') return kgToLbs(valueKg)
  return +valueKg.toFixed(2)
}

export function formatWeight(valueKg, unit) {
  return `${convertWeight(valueKg, unit)} ${unit}`
}
