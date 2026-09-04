# PêcheSanguinet

Application d’aide à la décision pour la pêche des carnassiers sur le **lac de Cazaux-Sanguinet**.

Ce n’est pas un agrégateur météo magique. La V1 calcule un **Indice de Frénésie (IF)** environnemental explicable à partir de données réelles Open-Meteo. Elle ne prétend pas que vous allez attraper un brochet.

## Lancer

```bash
npm install
npm test
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Données

| Couche | Source | Nature |
| --- | --- | --- |
| Air, pression, vent, nuages, 7 jours | Open-Meteo Forecast | prévision / modèle |
| Historique d’analogues | Open-Meteo ERA5 archive | réanalyse |
| Température de l’eau | climatologie + lag thermique | **estimation** |

Aucune donnée n’est inventée si l’API est down : cache horodaté ou « Donnée indisponible ».

## Stack

Next.js 15 · TypeScript · Tailwind · Recharts · MapLibre · JSON store local (`data/`) prêt à migrer vers PostgreSQL.

Le nom npm du projet est `peche-sanguinet` (le dossier Windows peut contenir des espaces).
