# AI 3D / world generation tools for WorldLibs (as of Nov 2026)

Method note: ~18 search/fetch calls. Many pricing figures come from aggregator sites (flagged). Anything not backed by a fetched or searched source is listed under Gaps, not as a finding. Weight licences and pricing change often; re-check each licence file at the commit actually downloaded.

## World models: Marble, Genie 3, HunyuanWorld, others (exportable and statically hostable?)

### Takeaway
Only World Labs Marble gives a clean static-hosting path today: splats (.spz/.ply) plus collider and GLB meshes, rendered in three.js via Spark. Genie 3/Project Genie is a streamed, US-only, Ultra-subscriber prototype with no found export path. HunyuanWorld gives meshes but under a territory-restricted licence that excludes the EU/UK.

### Cited Findings
- Marble outputs Gaussian splats plus collider and visual meshes; splats export as .spz (compressed native) or .ply, at roughly 2M or 500k splat tiers — [search summary citing World Labs docs](https://docs.worldlabs.ai/marble/export/gaussian-splat) (tier numbers from the search summary, not confirmed on the fetched page)
- Export docs recommend Spark (three.js-based) as the web renderer; plan gating: Free cannot export; Standard gets SPZ/PLY, panoramas, collider mesh; Pro gets GLB textured mesh plus commercial rights — [World Labs export docs](https://docs.worldlabs.ai/marble/export/gaussian-splat)
- API pricing: $1.00 = 1,250 credits; Marble 1.0/1.1 world = 1,500 credits (~$1.20) plus 0-100 pano credits; Draft = 150 credits (+0-100); Marble 1.1 Plus 1,500 + 0-1,500 variable (mean ~$1.71); HQ mesh export 3,500 credits ($2.80), cached free; PLY splat export free — [World Labs API pricing](https://docs.worldlabs.ai/api/pricing.md)
- Subscription tiers (one aggregator, dated Aug 2026): Free $0 (4 generations), Standard $20 (~12 worlds), Pro $35 (~25, commercial rights), Max $95 (~75) — [Rosebud/aggregator summary](https://lab.rosebud.ai/blog/what-is-marble-world-labs); [World Labs docs](https://docs.worldlabs.ai/marble/export/gaussian-splat) agrees Pro = commercial rights
- Beta posedImages2Splats API task turns posed RGBD views into refined SPZ splats for $5 per run — [Radiance Fields](https://radiancefields.com/world-labs-opens-gaussian-splat-creation-in-marble)
- World Labs Terms of Service and AUP exist; I did not read output-ownership clauses — [ToS](https://worldlabs.ai/terms-of-service)
- Project Genie (Genie 3) launched late Jan 2026 as an experimental prototype for Google AI Ultra subscribers, US, 18+, with expansion "in due course"; Google says broader availability depends on capacity and safety feedback — [Google blog](https://blog.google/innovation-and-ai/models-and-research/google-deepmind/project-genie/)
- Genie 3 is real-time generated interactive environments (a streamed model, not an asset exporter) — [Google blog](https://blog.google/innovation-and-ai/models-and-research/google-deepmind/project-genie/); the summary I saw did not mention any asset export
- HunyuanWorld 1.0 outputs a layered mesh world (standard mesh files); Voyager makes RGB+depth video along a user camera path from one image with a "world cache"; licence described as source-available with geographic and user limits — [The Neuron](https://www.theneuron.ai/explainer-articles/tencent-just-open-sourced-a-3d-world-generator), [The Decoder](https://the-decoder.com/tencents-voyager-can-simulate-camera-motion-in-3d-scenes-without-traditional-modeling-pipeline/), [arXiv 2507.21809](https://arxiv.org/abs/2507.21809v1)
- WildGaussians (CTU Prague/ETH) does splatting from unstructured web photo collections of landmarks — [The Decoder](https://the-decoder.com/wild-gaussians-new-ai-method-enables-3d-reconstruction-from-user-captured-web-photos/)

### Inferences
- A Marble splat (~500k tier, or lower after SPZ compression) could blow the 25 MB per-room budget if loaded whole; SPZ is the only format worth shipping. Needs a size test on a real export.
- Non-commercial site still needs Pro ($35) only if Marble's terms treat a free public site as "commercial"; check ToS before relying on it. Free tier cannot export at all.
- Marble/HunyuanWorld invent geometry from a prompt; for lost libraries that is "invented" tag at best.
- Genie 3 is unusable for a static site (streaming, gated, no export found). Treat as inspiration for "dynamic worlds like Roblox" only.

### Gaps
- Marble ToS output-ownership and non-commercial-site clauses not read.
- Actual SPZ file sizes per tier; whether Spark loads them within WebGPU/WebGL2 budget.
- HunyuanWorld licence text itself not fetched (only secondary descriptions); whether it carries the same EU/UK/South Korea carve-out is likely (same Tencent template) but unconfirmed here.
- Other text/image-to-world models (e.g. Odyssey, Dynamics Lab, Skybox/Blockade) not researched.

## Image/text-to-3D object models (props), licences, cost

### Takeaway
For build-time props, TRELLIS.2 (MIT) is the safest open-weight option but needs a 24 GB NVIDIA GPU; Hunyuan3D is unusable from the EU/UK; Meshy free tier outputs are CC BY 4.0, Tripo/Rodin are cheap per asset but closed APIs.

### Cited Findings
- TRELLIS.2-4B: MIT licence; 4B params; O-Voxel representation; output GLB (WebP textures) with PBR materials; 512^3 to 1536^3; ~3 s to ~60 s on H100; needs >=24 GB NVIDIA VRAM, Linux-tested, CUDA 12.4; raw meshes can have small holes; training-data bias — [HF model card](https://huggingface.co/microsoft/trellis.2-4b)
- Caveat: code is MIT but some dependent NVIDIA libraries carry non-commercial licences — [ComfyUI wiki / search summary](https://comfyui-wiki.com/en/models/trellis/trellis-2) (secondary source)
- Hunyuan3D 2.0 licence: "Territory" = worldwide excluding the European Union, United Kingdom and South Korea; use outside Territory is unlicensed; licence request needed above a monthly-active-user threshold (1 million in 2.0 text); Outputs may not be used to improve any other AI model — [Hunyuan3D-2 LICENSE](https://huggingface.co/tencent/Hunyuan3D-2/blob/main/LICENSE); carve-out reported across 2.0, 2.1, Omni — [search summary](https://open.windriver.com/info/uni-license-list/licenses/tencent-hunyuan-3d-2.0-cla.html)
- Stable Fast 3D: Stability AI Community License, free for non-commercial and commercial under $1M annual revenue; SPAR3D likewise under the Community License, enterprise licence above $1M — [Stability AI SPAR3D](https://stability.ai/news/stable-point-aware-3d), [Stability licence page](https://stability.ai/license)
- Meshy (aggregator data, Nov 2026): Free (100 credits/mo; reported cut from 200), Pro $20, Premium $40, Studio $70, Ultra $100; free plan outputs CC BY 4.0, with conflicting reports that free outputs are non-commercial — [Costbench](https://costbench.com/software/ai-3d-generation/meshy/free-plan/), [pricingsaas diff](https://pricingsaas.com/companies/meshy/diffs/2026W33); contradicted on licence wording by [Costbench](https://costbench.com/software/ai-3d-generation/meshy/) text. Verify at meshy.ai before use.
- Tripo ~US$0.30 per model, Pro ~US$19.9/mo for 3,000 credits; Rodin Gen-2 ~40 credits per download, plans from ~US$24/mo — [Costbench comparison](https://costbench.com/compare/rodin-hyper3d-vs-tripo-ai/) (aggregator; unverified against vendor pages)

### Inferences
- Props like lecterns, bookcases, scroll racks, clay tablets are low-detail, generic shapes where image-to-3D copes; astrolabes and anything with inscriptions/script will get garbled text. Always retopo/decimate and check poly budgets (<5-20k tris each) plus draco/meshopt/KTX2.
- Generate from a licensed reference photo or from a stylised "comparandum" image, never from a text prompt alone, so the source is recordable as paradata.
- Cost for a few dozen props is a few dollars to under $50 on any API; licence is the real discriminator. TRELLIS.2 needs a rented GPU (hours, a few dollars) given no local NVIDIA on Apple Silicon.
- Hunyuan3D: skip regardless of where the author sits; site viewers in the EU/UK are the audience, though licensing governs use of the model, not viewing of the output. Still avoid for clarity.

### Gaps
- CSM pricing/licence, Hunyuan3D 3.x licence, Rodin/Tripo output-licence terms from vendor pages: not retrieved.
- No hands-on quality test on libraries props.

## Splat generation from few photos / Commons photo sets

### Takeaway
Feed-forward reconstruction (VGGT-distilled AnySplat) and in-the-wild splatting (WildGaussians) make a room splat from unposed or crowd-sourced photos research-feasible; whether it is good enough from sparse Commons photos is unproven here.

### Cited Findings
- AnySplat: feed-forward 3DGS from uncalibrated, unposed images; predicts Gaussians and camera poses; distills priors from VGGT; SIGGRAPH Asia 2025 — [arXiv 2505.23716](https://arxiv.org/html/2505.23716v2)
- WildGaussians handles unstructured web photo collections (varying appearance, occluders) — [The Decoder](https://the-decoder.com/wild-gaussians-new-ai-method-enables-3d-reconstruction-from-user-captured-web-photos/)
- CULTURE3D is a large dataset of cultural landmarks in COLMAP format for Gaussian-based rendering — [arXiv 2501.06927](https://arxiv.org/abs/2501.06927v3)

### Inferences
- Commons photo licences (CC BY/BY-SA, PD) matter: a splat is arguably a derivative, so BY-SA photos could force share-alike on the splat and attribution per photo. Prefer PD/CC0/CC BY sources and log each in the evidence rows.
- Interiors of reading rooms are often photographed from a few viewpoints with people and mixed lighting; expect floaters. Splat is best for a fixed vantage or as a ghosted backdrop, while walking geometry comes from the hall-kit meshes.

### Gaps
- Licences of AnySplat, VGGT, MASt3R/DUSt3R weights (MASt3R is reportedly non-commercial, from background knowledge, unverified here).
- Real-world results on Commons photo sets of libraries; none found.

## Texture / material AI and upscalers

### Takeaway
Not researched in this pass beyond what appears above (TRELLIS.2 produces PBR; Marble produces textured GLB).

### Cited Findings
- TRELLIS.2 outputs PBR materials in GLB — [HF model card](https://huggingface.co/microsoft/trellis.2-4b)

### Inferences
- Default to non-AI CC0 sources (ambientCG, Poly Haven) for stone, wood, parchment; use AI only to fill gaps, with the prompt logged.

### Gaps
- Substance, SD texture LoRAs, upscaler licences and quality: no searches done.

## On-device AI in the browser (WebGPU)

### Takeaway
A small LLM narrator or depth estimator runs client-side but costs hundreds of MB to GBs on first load, which collides with a 5 MB initial budget; only acceptable as an opt-in, cached download.

### Cited Findings
- Transformers.js v4 has a rewritten WebGPU runtime (C++ compiled to WASM, up to ~4x speedups); models ~0.5B (~400 MB) to 3B (~2.4 GB) — [Besthub summary](https://besthub.dev/articles/run-full-ai-models-directly-in-the-browser-with-transformers-js-v4-0d2231b6758e) (secondary)
- Qwen3.5 0.8B/2B/4B demos run locally in browsers via Transformers.js — [RuntimeWire](https://runtimewire.com/article/alibaba-qwen3-5-small-browser-demo-local-ai)
- WebLLM supports ~1B-8B models, with multi-GB initial downloads cached afterward — [tianpan.co](https://tianpan.co/blog/2026/04/17/browser-native-llm-inference-webgpu)
- A Depth Anything v2 ("DA-2") ONNX WebGPU build is ~1.4 GB — [HF model card](https://huggingface.co/phiph/DA-2-WebGPU/blob/main/HF_MODEL_CARD.md)

### Inferences
- Image-to-3D in-browser is not realistic (TRELLIS.2 needs 24 GB VRAM). Depth estimation and LLM narration are possible but 400 MB-1.4 GB is 80-280x the initial budget; make it an explicit "Enable guide (~450 MB)" button, never default. Also WebGPU-only, no WebGL2 fallback.
- A narrator on a 0.5B-0.8B model will hallucinate; constrain with retrieval over evidence rows and refuse otherwise. A non-LLM alternative is pre-written, cited text strings, which is cheaper and has zero hallucination risk.

### Gaps
- Real download sizes of specific quantised small models (e.g. Qwen3.5-0.8B q4); battery/memory impact on phones.

## Build-time LLMs: quotes to hall-kit JSON, and constrained narrator

### Takeaway
Not found as a sourced practice in this pass; the design follows from the heritage-AI literature below.

### Cited Findings
- HARF (2026) proposes constraining AI reconstruction with archaeological evidence, dimensional analysis and expert review — [Copernicus EGU26 abstract](https://meetingorganizer.copernicus.org/EGU26/EGU26-21526.html) (via search summary)

### Inferences
- Pipeline: source quote + citation row, then LLM proposes JSON (dimensions, columns, bays), validated by JSON schema plus numeric checks (quote must contain the number; ranges; units), human sign-off, and a stored paradata record (model, prompt, date, quote id). Invented elements get tag "invented" automatically when no quote id exists.
- Run at build time, commit JSON; no runtime LLM calls.

### Gaps
- No published example of this exact workflow retrieved.

## Accuracy risks and heritage standards

### Takeaway
The literature names "hallucinated heritage" and aesthetic plausibility over authenticity as the main danger; the London Charter and Seville Principles require paradata and transparency, matching WorldLibs' evidence tags.

### Cited Findings
- London Charter: set of principles for technical and intellectual transparency of 3D visualisation; paradata should be recorded with the model and outlive the technology — [londoncharter.org](https://londoncharter.org/introduction.html), [Springer chapter](https://link.springer.com/chapter/10.1007/978-3-031-53946-6_4)
- Seville Principles foundations: interdisciplinarity, purpose, complementarity, authenticity, historical rigour, efficiency, scientific transparency, training and evaluation — [VWHL Indiana](https://vwhl.luddy.indiana.edu/sevillePrinciples/index.html)
- GenAI archaeology: black-box nature hinders reproducibility and peer review — [Eurographics DH 2025](https://diglib.eg.org/handle/10.2312/dh20253011)
- "Hallucinated heritage" (2026): convincing AI visuals spread fabrications to non-expert audiences; HARF notes plausibility-over-authenticity risk, citing the loss of the Bamiyan Buddha — via search summaries of [EGU26-21526](https://meetingorganizer.copernicus.org/EGU26/EGU26-21526.html) and related 2026 papers
- Concerns include bias and cultural insensitivity, notably for non-Western heritage — same search summary

### Inferences
- Make evidence tag a render-time attribute: invented elements visibly ghosted/desaturated/dashed; AI-generated assets carry an "AI-assisted" badge plus model and date in the info panel.
- Avoid AI-generated faces, text, or inscriptions (garbled script reads as authentic); no AI texture for tablets or scrolls with writing.

### Gaps
- How Pergamon As It Once Was, Rome Reborn, Notre-Dame twin handle AI: not searched.

## Which tool for which WorldLibs job

| Job | Tool | Where it runs | Notes |
|---|---|---|---|
| Lost-library mood/backdrop exploration | Marble (Pro tier, SPZ + collider) | build time, commit asset | tag "invented"; check size vs 25 MB; check ToS |
| Props (lectern, rack, bookcase) | TRELLIS.2 (rented GPU) or Tripo/Meshy API | build time | decimate; no inscriptions; log source image |
| Living room from Commons photos | AnySplat/VGGT or WildGaussians, then compress to SPZ | build time | photo licence propagation; vantage-limited |
| Walkable room geometry | Hand/param hall kit (three.js), LLM-assisted JSON | build time | evidence-tagged parameters |
| Materials | ambientCG / Poly Haven (non-AI), AI only for gaps | build time | |
| Guide/narrator | pre-written cited text first; optional opt-in small LLM + RAG | client WebGPU, 400 MB+ | opt-in only |
| Genie 3, HunyuanWorld, Hunyuan3D | skip | | gated / EU-UK excluded |
