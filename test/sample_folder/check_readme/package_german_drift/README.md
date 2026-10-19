# sample_package

English | [Deutsch](README.de.md)

Formats sample values for the tests of this repo.

## Motivation

The tests needed the same values in many places.

## Installation

```bash
dart pub add sample_package
```

## Usage

```dart
import 'package:sample_package/sample_package.dart';

void main() => print(format(List<String>.empty()));
```

It prints:

```text
[]
```

## Limitations

It formats lists only.

## Status

Stable.

## License

MIT — see [LICENSE](LICENSE).
