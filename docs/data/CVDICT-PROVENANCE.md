# CVDICT offline import data

- Upstream: `ph0ngp/CVDICT`
- Pinned upstream commit: `c379d909e308343a247e51619f7839a2060a271c`
- Source file: `CVDICT.u8`
- Source SHA-256: `4dde4b204193efa9c192d7f7daeab1bb579c8ccd7c41ed90d1b6caee22ba0948`
- Generated asset: `public/cvdict-v1.u8.gz`
- Generated SHA-256: `9c87a201ca6be7985a500b715666e4553d614f4f08e8d3d29e73665d7eb3ed85`
- License: Creative Commons Attribution-ShareAlike 4.0 International

ScottBook uses the Vietnamese definitions only for automatic, offline assistance
on user-imported text. These definitions are machine-generated upstream and may
contain errors, so imported content is labeled “Phân tích tự động” throughout the
app. Built-in authored articles do not use this automatic label.

Rebuild the deterministic gzip asset with:

```sh
node scripts/build-cvdict-data.mjs /path/to/CVDICT.u8
```
