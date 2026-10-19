# sample_package

[English](README.md) | Deutsch

Formatiert Beispielwerte für die Tests dieses Repos.

## Motivation

Die Tests brauchten dieselben Werte an vielen Stellen.

## Installation

```bash
dart pub add sample_package
```

## Verwendung

```dart
import 'package:sample_package/sample_package.dart';

void main() => print(format(List<String>.empty()));
```

Es gibt aus:

```text
[]
```

## Grenzen

Es formatiert nur Listen.

## Status

Stabil.

## Lizenz

MIT — siehe [LICENSE](LICENSE).
