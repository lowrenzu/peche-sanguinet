import { Label, Panel } from "@/components/ui";

export default function SourcesPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Sources & méthodologie</h1>
      <Panel>
        <Label>Ce que dit l&apos;application</Label>
        <p className="mt-3 text-mist-300">
          « Les conditions environnementales correspondent actuellement à une configuration historiquement
          favorable selon notre modèle. »
        </p>
        <p className="mt-2 text-signal-mid">Elle ne dit jamais : « Vous allez attraper un brochet. »</p>
      </Panel>
      <Panel>
        <Label>Données météo</Label>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-mist-300">
          <li>
            <strong>Open-Meteo Forecast</strong> — observations/prévisions horaires au point Sanguinet
            (44.482, -1.086). Source unique pour le temps présent et J+7.
          </li>
          <li>
            <strong>Open-Meteo Archive / ERA5</strong> — historique quotidien, matching d&apos;analogues. Jamais
            mélangé silencieusement avec le forecast : chaque champ garde sa source.
          </li>
        </ul>
      </Panel>
      <Panel>
        <Label>Température de l&apos;eau</Label>
        <p className="mt-3 text-sm text-mist-300">
          Pas de station in situ branchée en V1. Le moteur combine une climatologie mensuelle documentée
          du lac et un lag thermique sur la moyenne d&apos;air. Toujours affiché comme{" "}
          <strong>ESTIMATION — confiance moyenne</strong>. L&apos;air n&apos;est jamais présenté comme température
          d&apos;eau.
        </p>
      </Panel>
      <Panel>
        <Label>Indice de frénésie V1</Label>
        <p className="mt-3 text-sm text-mist-300">
          Score pondéré : eau 30 %, pression 20 %, vent 20 %, nébulosité 15 %, similarité historique 15 %.
          Les tendances (Δ pression 3/6/12/24 h) pèsent plus que les valeurs isolées. Coefficients
          configurables, non définitifs.
        </p>
      </Panel>
      <Panel>
        <Label>Limites</Label>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-mist-300">
          <li>Pas d&apos;astrologie, pas de lune comme facteur principal.</li>
          <li>Pas de bathymétrie inventée.</li>
          <li>Pas de statistiques de capture tant que le journal est vide.</li>
          <li>Si une API tombe : dernières données valides, ou « Donnée indisponible ».</li>
        </ul>
      </Panel>
    </div>
  );
}
