# VolumeDetector

Composant niloc qui mesure le niveau sonore d'un [`LiveInstrument`](../src/components/LiveInstrument.ts).

## Fichiers

| Fichier | Rôle |
|---------|------|
| [`VolumeDetector.ts`](../src/components/VolumeDetector.ts) | Composant — tap audio, boucle, dispose |
| [`VolumeMeasurement.ts`](../src/sound/volume/VolumeMeasurement.ts) | Utilitaire pur — RMS → dB → 0–1 (sans lissage) |

## Algorithme

1. **RMS** sur le domaine temporel (`getFloatTimeDomainData`)
2. **Conversion dB** : `20 * log10(rms)`
3. **Normalisation** via `instrument.range` → 0–1
4. **Enveloppe** attack/release (défaut : 10 ms / 150 ms)

## Usage

```tsx
import { VolumeDetector } from "../../components/VolumeDetector"
import { useComponentInstance } from "../../hooks/useComponentInstance"

const detector = useComponentInstance(VolumeDetector, instrument)
const { volume } = useComponent(detector)
```

Options optionnelles au constructeur :

```ts
new VolumeDetector(engine, instrument, { attackMs: 10, releaseMs: 150 })
```

## Cycle de vie

Le composant gère lui-même :

- création et connexion du `SoundAnalyserNode` sur `instrument.rawOutput`
- boucle `Schedules.Frame` avec delta time réel
- `destroy()` de l'analyser

## Calibration AudioRange (futur)

Pour `AudioRangeTuner`, utiliser `VolumeMeasurement.measure()` directement (sans enveloppe) :

```ts
import { VolumeMeasurement } from "../sound/volume/VolumeMeasurement"

const instant = VolumeMeasurement.measure(samples, range)
```
